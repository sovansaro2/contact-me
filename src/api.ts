import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db/index.js';
import { users, profiles, contactMethods } from './db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-2026';

export const apiRouter = Router();

// Middleware to authenticate JWT
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const mapProfile = (p: any) => p ? {
  id: p.userId,
  display_name: p.displayName,
  bio: p.bio,
  avatar_url: p.avatarUrl,
  cover_url: p.coverUrl,
  theme_settings: null,
  created_at: p.updatedAt,
  updated_at: p.updatedAt
} : null;

const mapContactMethod = (c: any) => c ? {
  id: c.id,
  profile_id: c.userId,
  type: c.type,
  label: c.title,
  value: c.value,
  icon: null,
  enabled: c.enabled,
  sort_order: parseInt(c.order) || 0,
  created_at: c.createdAt,
  updated_at: c.updatedAt
} : null;

// --- AUTH ---
apiRouter.post('/auth/register', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash
    }).returning();
    
    await db.insert(profiles).values({
      userId: newUser.id,
      displayName: email.split('@')[0],
    });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: newUser.id, email: newUser.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.passwordHash) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/auth/me', authenticate, async (req: any, res: any) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROFILES ---
apiRouter.get('/profiles/public/:id', async (req: any, res: any) => {
  try {
    let profile;
    if (req.params.id === 'default' || req.params.id === 'undefined') {
       const profilesList = await db.select().from(profiles).limit(1);
       profile = profilesList[0];
    } else {
       const profilesList = await db.select().from(profiles).where(eq(profiles.userId, req.params.id));
       profile = profilesList[0];
    }
    
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile: mapProfile(profile) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/profiles/me', authenticate, async (req: any, res: any) => {
  try {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.user.userId));
    res.json({ profile: mapProfile(profile) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/profiles/me', authenticate, async (req: any, res: any) => {
  try {
    const { display_name, bio, avatar_url, cover_url } = req.body;
    
    const [existing] = await db.select().from(profiles).where(eq(profiles.userId, req.user.userId));
    
    if (existing) {
      const [updated] = await db.update(profiles)
        .set({ 
          displayName: display_name, 
          bio, 
          avatarUrl: avatar_url, 
          coverUrl: cover_url, 
          updatedAt: new Date() 
        })
        .where(eq(profiles.userId, req.user.userId))
        .returning();
      res.json({ profile: mapProfile(updated) });
    } else {
      const [created] = await db.insert(profiles)
        .values({ 
          userId: req.user.userId, 
          displayName: display_name, 
          bio, 
          avatarUrl: avatar_url, 
          coverUrl: cover_url 
        })
        .returning();
      res.json({ profile: mapProfile(created) });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CONTACT METHODS ---
apiRouter.get('/contact-methods/public/:id', async (req: any, res: any) => {
  try {
    const methods = await db.select().from(contactMethods).where(eq(contactMethods.userId, req.params.id));
    const active = methods.filter(m => m.enabled).sort((a: any, b: any) => parseInt(a.order) - parseInt(b.order));
    res.json({ contactMethods: active.map(mapContactMethod) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/contact-methods/me', authenticate, async (req: any, res: any) => {
  try {
    const methods = await db.select().from(contactMethods).where(eq(contactMethods.userId, req.user.userId));
    res.json({ contactMethods: methods.sort((a: any, b: any) => parseInt(a.order) - parseInt(b.order)).map(mapContactMethod) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/contact-methods', authenticate, async (req: any, res: any) => {
  try {
    const { type, value, label, enabled, sort_order } = req.body;
    const [created] = await db.insert(contactMethods).values({
      userId: req.user.userId,
      type, 
      value, 
      title: label, 
      enabled, 
      order: sort_order?.toString() || '0'
    }).returning();
    res.json({ contactMethod: mapContactMethod(created) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/contact-methods/:id', authenticate, async (req: any, res: any) => {
  try {
    const { type, value, label, enabled, sort_order } = req.body;
    
    // We only update fields that were provided
    const updateData: any = { updatedAt: new Date() };
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (label !== undefined) updateData.title = label;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (sort_order !== undefined) updateData.order = sort_order.toString();

    const [updated] = await db.update(contactMethods)
      .set(updateData)
      .where(eq(contactMethods.id, req.params.id))
      .returning();
    res.json({ contactMethod: mapContactMethod(updated) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/contact-methods/:id', authenticate, async (req: any, res: any) => {
  try {
    await db.delete(contactMethods).where(eq(contactMethods.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/contact-methods/reorder', authenticate, async (req: any, res: any) => {
  try {
    const { orderedIds } = req.body;
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(contactMethods)
        .set({ order: i.toString() })
        .where(eq(contactMethods.id, orderedIds[i]));
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

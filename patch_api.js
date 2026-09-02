import fs from 'fs';

const content = fs.readFileSync('src/api.ts', 'utf-8');
const newEndpoint = `
apiRouter.put('/auth/update-account', authenticate, async (req: any, res: any) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    // verify current password
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId));
    if (!user || !user.passwordHash) return res.status(400).json({ error: 'User not found' });
    
    if (currentPassword || newPassword || email) {
       // if they want to change something, they might need current password for security if changing password?
       // Actually, let's just make it simple.
       if (newPassword && !currentPassword) {
         return res.status(400).json({ error: 'Current password is required to change password' });
       }
       if (newPassword && currentPassword) {
         const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
         if (!isValid) return res.status(400).json({ error: 'ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវទេ (Current password incorrect)' });
       }
    }

    const updateData: any = {};
    if (email && email !== user.email) {
      // Check if email already exists
      const [existing] = await db.select().from(users).where(eq(users.email, email));
      if (existing) return res.status(400).json({ error: 'អ៊ីមែលនេះមានគេប្រើរួចហើយ (Email already exists)' });
      updateData.email = email;
    }

    if (newPassword && currentPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, req.user.userId));
      
      const [updatedUser] = await db.select().from(users).where(eq(users.id, req.user.userId));
      
      // If password or email changed, maybe issue a new token
      const token = jwt.sign({ userId: updatedUser.id, email: updatedUser.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: updatedUser.id, email: updatedUser.email } });
    }

    res.json({ success: true, message: 'No changes made' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROFILES ---`;

const patched = content.replace('// --- PROFILES ---', newEndpoint);
fs.writeFileSync('src/api.ts', patched);

import fs from 'fs';

let content = fs.readFileSync('src/pages/public/PublicPage.tsx', 'utf-8');

// add Link import
content = content.replace(
  "import { useParams } from 'react-router-dom';", 
  "import { useParams, Link } from 'react-router-dom';"
);

// replace footer
const oldFooter = `<motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-6 mt-12 flex justify-center"
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-200/80 dark:bg-[#d9a441]/20" />
        </motion.div>`;

const newFooter = `<motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-6 mt-12 flex flex-col items-center justify-center gap-6"
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-200/80 dark:bg-[#d9a441]/20" />
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-[13px] font-medium text-stone-400 opacity-60 transition-all hover:text-stone-600 hover:opacity-100 dark:text-[#9a8b6f] dark:hover:text-[#d9a441]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {lang === 'kh' ? 'សម្រាប់អ្នកគ្រប់គ្រង (Admin)' : 'Admin Login'}
          </Link>
        </motion.div>`;

content = content.replace(oldFooter, newFooter);

fs.writeFileSync('src/pages/public/PublicPage.tsx', content);

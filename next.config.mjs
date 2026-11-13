if (process.env.VERCEL === '1' && !process.env.NEXT_PUBLIC_KEYSTATIC_REPOSITORY) {
  throw new Error('Stel NEXT_PUBLIC_KEYSTATIC_REPOSITORY in voor Keystatic GitHub-opslag op Vercel.');
}

export default {
  devIndicators: false,
  outputFileTracingIncludes: {
    '/artikelen': ['./content/artikelen/**/*.md'],
    '/artikelen/*': ['./content/artikelen/**/*.md'],
  },
};

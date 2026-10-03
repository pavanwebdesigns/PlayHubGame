module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      staticDistDir: './out',
      url: ['/', '/game/prism-match-3d/', '/search/', '/category/puzzle/'],
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 1.75,
          disabled: false,
        },
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};

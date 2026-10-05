module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      staticDistDir: './out',
      url: ['/', '/game/prism-match-3d/', '/search/', '/category/puzzle/'],
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
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

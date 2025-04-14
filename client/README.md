project-root/
├── public/                   # Static files
├── src/                      # Source code
│   ├── assets/               # Images, fonts, etc.
│   │   ├── images/
│   │   └── fonts/
│   ├── components/           # Reusable components
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.scss
│   │   │   └── index.js      # Re-export for clean imports
│   │   ├── Card/
│   │   │   ├── Card.jsx
│   │   │   ├── Card.scss
│   │   │   └── index.js
│   │   └── ...
│   ├── layouts/              # Layout components
│   │   ├── MainLayout/
│   │   ├── AuthLayout/
│   │   └── ...
│   ├── pages/                # Page components
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.scss
│   │   │   ├── components/   # Page-specific components
│   │   │   └── index.js
│   │   └── ...
│   ├── services/             # API services
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   └── ...
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utility functions
│   ├── context/              # React context providers
│   ├── styles/               # Global styles & SCSS system
│   │   ├── abstracts/        # SCSS tools that don't output CSS
│   │   │   ├── _variables.scss  # Variables for colors, fonts, etc.
│   │   │   ├── _functions.scss  # SCSS functions
│   │   │   ├── _mixins.scss     # SCSS mixins
│   │   │   └── _index.scss      # Forwards all abstracts
│   │   ├── base/             # Base styles
│   │   │   ├── _reset.scss      # CSS reset/normalize
│   │   │   ├── _typography.scss # Typography rules
│   │   │   ├── _animations.scss # Animations
│   │   │   └── _index.scss      # Forwards all base styles
│   │   ├── components/       # Global component styles
│   │   │   ├── _buttons.scss    # Global button styles
│   │   │   ├── _forms.scss      # Global form styles
│   │   │   └── _index.scss      # Forwards all component styles
│   │   ├── themes/           # Different theme styles
│   │   │   ├── _light.scss      # Light theme variables
│   │   │   ├── _dark.scss       # Dark theme variables
│   │   │   └── _index.scss      # Theme selection logic
│   │   ├── vendors/          # 3rd party CSS/overrides
│   │   └── main.scss         # Main SCSS file that imports all others
│   ├── constants/            # App constants
│   ├── config/               # App configuration
│   ├── types/                # TypeScript type definitions
│   ├── store/                # State management (Redux/Zustand)
│   ├── App.jsx               # Main App component
│   ├── index.jsx             # Entry point
│   └── routes.jsx            # Route definitions
├── .env                      # Environment variables
├── .gitignore
├── package.json
├── README.md
└── ...
# Crease and Canvas - Pop-Up Card Maker

A web application that helps users create beautiful 3D pop-up cards with step-by-step instructions and customizable designs.

## Features

- 🎨 **Design Gallery** - Choose from 12+ pre-made designs (hearts, flowers, stars, cakes, etc.)
- 📋 **Multiple Pop-Up Mechanisms** - 6 different pop-up techniques from beginner to advanced:
  - Basic Tab Pop-Up
  - V-Fold Pop-Up
  - Parallel Fold
  - Box Pop-Up
  - Rotating Mechanism
  - Accordion Fold
- 📝 **Step-by-Step Instructions** - Visual diagrams with color-coded guides for cutting, folding, and gluing
- 🖼️ **Upload Your Own Design** - Upload and analyze your custom drawings
- 🎭 **Layer Editor** - Use lasso tool to create and customize multiple layers for 3D depth
- 🔍 **Search for Inspiration** - Browse design ideas for your cards

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd code
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Start the development server:
```bash
pnpm run dev
# or
npm run dev
```

The app will be running at the local development server.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── HomePage.tsx          # Main landing page
│   │   ├── InspirationGallery.tsx # Design gallery
│   │   ├── InstructionsView.tsx  # Step-by-step instructions
│   │   ├── LayerEditor.tsx       # Layer editing canvas
│   │   ├── UploadSection.tsx     # File upload interface
│   │   ├── DiagramKey.tsx        # Color-coded legend
│   │   ├── InstructionDiagram.tsx # Visual instruction diagrams
│   │   ├── MechanismDiagrams.tsx  # Pop-up mechanism diagrams
│   │   └── ui/                   # Reusable UI components
│   └── App.tsx                   # Main app component
└── styles/
    ├── theme.css                 # Design tokens
    └── fonts.css                 # Font imports
```

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons
- **Radix UI** - Accessible components

## How It Works

1. **Choose a Starting Point**: Upload your own design or browse the inspiration gallery
2. **Select a Pop-Up Mechanism**: Pick from 6 different techniques based on your skill level
3. **Follow the Instructions**: Visual step-by-step guides show you exactly how to cut, fold, and assemble
4. **Customize Layers**: Use the layer editor to create depth and 3D effects
5. **Create Your Card**: Follow the diagrams to bring your pop-up card to life!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project was created with Figma Make.

## Acknowledgments

- Design inspiration from traditional pop-up card techniques
- Built with React and Tailwind CSS
- Created using Figma Make

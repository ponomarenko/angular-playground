# Angular Playground

A modern Angular (v19) utility application providing various developer tools and encoders. This project serves as both a practical toolset and a demonstration of Angular best practices.

## Features

- **UUID Generator**
  - Generates RFC 4122 compliant UUIDs
  - Displays detailed UUID information and metadata
  - Supports UUID validation and normalization
  - One-click copy to clipboard functionality

- **URL Encoder/Decoder**
  - Encodes and decodes URLs using encodeURIComponent/decodeURIComponent
  - Real-time encoding/decoding
  - Clipboard integration
  - Input validation and error handling

- **IP Location Lookup**
  - Retrieves detailed IP information using ipinfo.io API
  - Displays geographic and network details
  - Supports custom IP lookups
  - Responsive grid layout for information display

- **Unix Timestamp Converter**
  - Converts between Unix timestamps and human-readable dates
  - Supports multiple timestamp formats (s, ms, μs, ns)
  - Real-time updates
  - Multiple date format displays (GMT, Local, ISO 8601, RFC 822/2822/3339)

## Technical Stack

- Angular 20+
- Angular Material UI Components
- RxJS
- TypeScript 5.5
- Angular CDK (Clipboard, Component Dev Kit)
- Standalone Components Architecture

## Architecture Highlights

- Standalone components architecture
- Lazy-loaded routing
- Material Design integration
- Responsive layout
- GitHub Pages deployment pipeline
- Strict TypeScript configuration
- Component-based architecture

## Development Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build and Deployment

Build the project for production:

```bash
npm run build
```

The project is automatically deployed to GitHub Pages using GitHub Actions when changes are pushed to the main branch.

## Testing

Run unit tests:

```bash
npm test
```

## Project Structure

- Standalone components for each utility
- Shared Material UI components
- Reactive forms for user input
- Service-based architecture for data handling
- Comprehensive error handling
- Clipboard integration across components

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is open source and available under the MIT License.

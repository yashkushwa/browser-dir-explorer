
# Python Browser Directory Explorer

A minimal file management application for exploring and managing files through the browser, built with Python and Flask.

## Features

- Browse directories and files
- Create new folders
- Rename files and folders
- Delete files and folders
- Download files
- Navigation history (back/forward)
- Clean, minimal UI with subtle animations

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Run the application:

```bash
python app.py
```

3. Access the application at http://localhost:8080

## Security Notes

This application provides direct access to your file system through the browser. It is recommended to:

- Only run this on trusted networks
- Be careful when deleting or renaming files as there is no trash or undo functionality
- Consider adding authentication for production use

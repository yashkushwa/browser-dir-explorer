
import React, { useState, useEffect } from "react";
import { Folder, File, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type FileItem = {
  name: string;
  type: "file" | "directory";
  path: string;
  lastModified?: number;
  size?: number;
};

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>("");
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Mock function to simulate reading directory contents
  const readDirectory = async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call a server endpoint or use File System Access API
      // For this demo, we'll generate mock data
      const mockFiles: FileItem[] = [
        { name: "Documents", type: "directory", path: `${path}/Documents` },
        { name: "Images", type: "directory", path: `${path}/Images` },
        { name: "readme.txt", type: "file", path: `${path}/readme.txt`, size: 1024, lastModified: Date.now() - 86400000 },
        { name: "config.json", type: "file", path: `${path}/config.json`, size: 512, lastModified: Date.now() },
        { name: "example.js", type: "file", path: `${path}/example.js`, size: 2048, lastModified: Date.now() - 172800000 },
      ];
      
      setTimeout(() => {
        setFiles(mockFiles);
        setIsLoading(false);
      }, 300); // Simulate network delay
    } catch (err) {
      setError("Failed to read directory");
      setIsLoading(false);
    }
  };

  // Mock function to simulate deleting a file
  const deleteFile = async (file: FileItem) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call a server endpoint
      // For this demo, we'll just remove it from our state
      setTimeout(() => {
        setFiles(files.filter(f => f.path !== file.path));
        setIsLoading(false);
        setIsDeleteDialogOpen(false);
      }, 300);
    } catch (err) {
      setError("Failed to delete file");
      setIsLoading(false);
    }
  };

  // Mock function to simulate renaming a file
  const renameFile = async (file: FileItem, newName: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call a server endpoint
      // For this demo, we'll just update our state
      setTimeout(() => {
        const newPath = file.path.substring(0, file.path.lastIndexOf('/') + 1) + newName;
        setFiles(files.map(f => {
          if (f.path === file.path) {
            return { ...f, name: newName, path: newPath };
          }
          return f;
        }));
        setIsLoading(false);
        setIsRenameDialogOpen(false);
      }, 300);
    } catch (err) {
      setError("Failed to rename file");
      setIsLoading(false);
    }
  };

  // Navigate to a directory
  const navigateToDirectory = (path: string) => {
    // Add current path to history before navigating
    if (currentPath !== path) {
      const newHistory = [...pathHistory.slice(0, historyIndex + 1), currentPath];
      setPathHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setCurrentPath(path);
    readDirectory(path);
  };

  // Handle navigation back
  const goBack = () => {
    if (historyIndex >= 0) {
      const previousPath = pathHistory[historyIndex];
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(previousPath);
      readDirectory(previousPath);
    }
  };

  // Handle navigation forward
  const goForward = () => {
    if (historyIndex < pathHistory.length - 1) {
      const nextPath = pathHistory[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(nextPath);
      readDirectory(nextPath);
    }
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString();
  };

  // Initial load
  useEffect(() => {
    // Set root path and load files
    const rootPath = "/";
    setCurrentPath(rootPath);
    readDirectory(rootPath);
  }, []);

  // Handle double click on item
  const handleItemDoubleClick = (file: FileItem) => {
    if (file.type === "directory") {
      navigateToDirectory(file.path);
    }
  };

  // Open rename dialog
  const handleRename = (file: FileItem) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    setIsRenameDialogOpen(true);
  };

  // Open delete dialog
  const handleDelete = (file: FileItem) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  // Confirm rename
  const confirmRename = () => {
    if (selectedFile && newFileName) {
      renameFile(selectedFile, newFileName);
    }
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedFile) {
      deleteFile(selectedFile);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-zinc-900 animate-fade-in">
      {/* Navigation bar */}
      <div className="flex items-center p-2 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goBack} 
          disabled={historyIndex < 0}
          className="mr-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goForward} 
          disabled={historyIndex >= pathHistory.length - 1}
          className="mr-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="text-sm truncate flex-1 bg-gray-100 dark:bg-zinc-900 p-2 rounded">
          {currentPath || "/"}
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : files.length === 0 ? (
          <div className="text-gray-500 p-4">No files found</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800">
                <th className="text-left p-2 text-gray-500 text-sm">Name</th>
                <th className="text-left p-2 text-gray-500 text-sm">Size</th>
                <th className="text-left p-2 text-gray-500 text-sm">Modified</th>
                <th className="text-right p-2 text-gray-500 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr 
                  key={file.path} 
                  onDoubleClick={() => handleItemDoubleClick(file)}
                  className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <td className="p-2 flex items-center">
                    {file.type === "directory" ? (
                      <Folder className="h-4 w-4 mr-2 text-blue-500" />
                    ) : (
                      <File className="h-4 w-4 mr-2 text-gray-500" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </td>
                  <td className="p-2 text-sm text-gray-500">
                    {file.type === "directory" ? "" : formatSize(file.size)}
                  </td>
                  <td className="p-2 text-sm text-gray-500">
                    {formatDate(file.lastModified)}
                  </td>
                  <td className="p-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRename(file)}
                      className="h-8 w-8 p-0 mr-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(file)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status bar */}
      <div className="p-2 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-500">
        {files.length} items
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename {selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="New name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={!newFileName}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            Are you sure you want to delete this {selectedFile?.type}? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManager;

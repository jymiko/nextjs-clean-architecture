"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Link as LinkIcon,
  Table as TableIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuButton = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded-lg hover:bg-gray-100 transition-colors",
      isActive && "bg-gray-100"
    )}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-6 bg-[#D1D5DC] mx-1" />
);

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write something...",
  className,
}: RichTextEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Table modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);

  // Paragraph/Heading dropdown state
  const [showParagraphDropdown, setShowParagraphDropdown] = useState(false);
  const paragraphDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paragraphDropdownRef.current && !paragraphDropdownRef.current.contains(event.target as Node)) {
        setShowParagraphDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic',
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 font-bold p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      CharacterCount,
    ],
    content: value,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[350px] px-4 py-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_a]:text-blue-600 [&_a]:underline [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:font-bold [&_td]:border [&_td]:border-gray-300 [&_td]:p-2",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const wordCount = editor.storage.characterCount.words();

  // Get current text block type
  const getCurrentBlockType = () => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    return "Paragraph";
  };

  const setBlockType = (type: string) => {
    switch (type) {
      case "Heading 1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "Heading 2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "Heading 3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      default:
        editor.chain().focus().setParagraph().run();
    }
    setShowParagraphDropdown(false);
  };

  const blockTypes = ["Paragraph", "Heading 1", "Heading 2", "Heading 3"];

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '');

    setLinkUrl(previousUrl || 'https://');
    setLinkText(text || '');
    setShowLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!linkUrl) {
      setShowLinkModal(false);
      return;
    }

    // Validate URL format
    let validUrl = linkUrl;
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
      validUrl = 'https://' + linkUrl;
    }

    // If there's text to wrap
    if (linkText && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${validUrl}">${linkText}</a>`)
        .run();
    } else {
      // Update existing selection
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: validUrl })
        .run();
    }

    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const openTableModal = () => {
    setTableRows(3);
    setTableCols(3);
    setTableWithHeader(true);
    setShowTableModal(true);
  };

  const handleInsertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: tableWithHeader })
      .run();
    setShowTableModal(false);
  };

  return (
    <div className={cn("border border-[#E5E7EB] rounded-lg shadow-sm", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-[#E5E7EB] bg-[rgba(249,250,251,0.5)] rounded-t-lg flex-wrap">
        {/* Paragraph/Heading dropdown */}
        <div className="relative" ref={paragraphDropdownRef}>
          <button
            type="button"
            onClick={() => setShowParagraphDropdown(!showParagraphDropdown)}
            className="flex items-center gap-1 px-3 py-1 border border-[#D1D5DC] rounded-lg bg-white min-w-[100px] hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-[#0A0A0A]">{getCurrentBlockType()}</span>
            <svg
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform",
                showParagraphDropdown && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showParagraphDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#D1D5DC] rounded-lg shadow-lg z-50 min-w-[140px]">
              {blockTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBlockType(type)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg",
                    getCurrentBlockType() === type && "bg-gray-100 font-medium"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Text formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Alignment */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Quote */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>

        {/* Link */}
        <MenuButton
          onClick={openLinkModal}
          isActive={editor.isActive("link")}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </MenuButton>

        {/* Table */}
        <MenuButton onClick={openTableModal} title="Insert Table">
          <TableIcon className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[350px]" />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#E5E7EB] bg-[rgba(249,250,251,0.5)] rounded-b-lg">
        <span className="text-sm text-[#6A7282]">Word count: {wordCount}</span>
      </div>

      {/* Link Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#384654] flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-[#4DB1D4]" />
              {editor.getAttributes('link').href ? 'Edit Link' : 'Insert Link'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="link-url" className="text-[#323238] text-sm font-bold">
                URL
              </Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="h-12 border-[#E1E1E6] rounded-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveLink();
                  }
                }}
              />
            </div>

            {/* Text Input (optional) */}
            <div className="space-y-2">
              <Label htmlFor="link-text" className="text-[#323238] text-sm font-bold">
                Link Text <span className="text-[#8D8D99] font-normal">(optional)</span>
              </Label>
              <Input
                id="link-text"
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here"
                className="h-12 border-[#E1E1E6] rounded-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveLink();
                  }
                }}
              />
              <p className="text-xs text-[#8D8D99]">
                Leave empty to use selected text
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div>
              {editor.getAttributes('link').href && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveLink}
                  className="border-[#F24822] text-[#F24822] hover:bg-[#FFD6CD]"
                >
                  Remove Link
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLinkModal(false)}
                className="border-[#E1E2E3] text-[#384654]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveLink}
                className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
              >
                Save Link
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Modal */}
      <Dialog open={showTableModal} onOpenChange={setShowTableModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#384654] flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-[#4DB1D4]" />
              Insert Table
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rows Input */}
            <div className="space-y-2">
              <Label htmlFor="table-rows" className="text-[#323238] text-sm font-bold">
                Number of Rows
              </Label>
              <Input
                id="table-rows"
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                className="h-12 border-[#E1E1E6] rounded-sm"
              />
            </div>

            {/* Columns Input */}
            <div className="space-y-2">
              <Label htmlFor="table-cols" className="text-[#323238] text-sm font-bold">
                Number of Columns
              </Label>
              <Input
                id="table-cols"
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="h-12 border-[#E1E1E6] rounded-sm"
              />
            </div>

            {/* Header Row Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="table-header"
                checked={tableWithHeader}
                onChange={(e) => setTableWithHeader(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#4DB1D4] focus:ring-[#4DB1D4]"
              />
              <Label htmlFor="table-header" className="text-[#323238] text-sm">
                Include header row
              </Label>
            </div>

            {/* Preview */}
            <div className="border border-[#E1E1E6] rounded-sm p-3 bg-gray-50">
              <p className="text-xs text-[#8D8D99] mb-2">Preview:</p>
              <div className="overflow-auto max-h-32">
                <table className="border-collapse text-xs w-full">
                  {tableWithHeader && (
                    <thead>
                      <tr>
                        {Array.from({ length: tableCols }).map((_, i) => (
                          <th key={i} className="border border-gray-300 bg-gray-200 p-1 text-center">
                            Col {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {Array.from({ length: tableWithHeader ? tableRows - 1 : tableRows }).map((_, rowIdx) => (
                      <tr key={rowIdx}>
                        {Array.from({ length: tableCols }).map((_, colIdx) => (
                          <td key={colIdx} className="border border-gray-300 p-1 text-center">
                            -
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTableModal(false)}
                className="border-[#E1E2E3] text-[#384654]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleInsertTable}
                className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
              >
                Insert Table
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

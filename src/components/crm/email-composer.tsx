"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { AVAILABLE_TOKENS, replaceTokens } from "@/lib/email-tokens";
import { wrapEmailHtml } from "@/lib/email-html";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SendVia = "resend" | "outlook";

interface EmailComposerProps {
  to?: string | string[];
  recipientCount?: number;
  defaultSubject?: string;
  defaultBody?: string;
  tokenData?: Record<string, string | undefined>;
  onSend: (data: { to: string[]; subject: string; body: string; sendVia: SendVia }) => Promise<void>;
  onClose?: () => void;
  senderName?: string;
  senderEmail?: string;
  microsoftConnected?: boolean;
  microsoftEmail?: string | null;
}

// ---------------------------------------------------------------------------
// Token groups for the dropdown
// ---------------------------------------------------------------------------

function getTokenGroup(token: string): string {
  const key = token.replace(/[{}]/g, "");
  if (/^(firstName|lastName|fullName|email|location|topSkill|skills)$/.test(key))
    return "Candidate";
  if (key.startsWith("job")) return "Job";
  if (key.startsWith("company") || key.startsWith("contact")) return "Company";
  return "OSCABE";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmailComposer({
  to,
  recipientCount,
  defaultSubject = "",
  defaultBody = "",
  tokenData = {},
  onSend,
  onClose,
  senderName,
  senderEmail,
  microsoftConnected = false,
  microsoftEmail,
}: EmailComposerProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [sending, setSending] = useState(false);
  const [sendVia, setSendVia] = useState<SendVia>("resend");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Normalise recipients
  const recipients = useMemo(() => {
    if (!to) return [];
    return Array.isArray(to) ? to : [to];
  }, [to]);

  const recipientLabel = useMemo(() => {
    if (recipientCount && recipientCount > 1) return `${recipientCount} recipients selected`;
    if (recipients.length === 1) return recipients[0];
    if (recipients.length > 1) return `${recipients.length} recipients selected`;
    return "No recipients";
  }, [recipients, recipientCount]);

  // -------------------------------------------------------------------------
  // Tiptap editor
  // -------------------------------------------------------------------------

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write your email here..." }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: defaultBody,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] px-4 py-3 outline-none focus:outline-none",
      },
    },
  });

  // -------------------------------------------------------------------------
  // Toolbar helpers
  // -------------------------------------------------------------------------

  const insertToken = useCallback(
    (token: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(token).run();
    },
    [editor],
  );

  const insertTokenInSubject = useCallback(
    (token: string) => {
      setSubject((prev) => prev + token);
    },
    [],
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  const editorText = editor?.getText() ?? "";
  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const charCount = editorText.length;

  // -------------------------------------------------------------------------
  // Preview HTML
  // -------------------------------------------------------------------------

  const previewHtml = useMemo(() => {
    if (mode !== "preview" || !editor) return "";
    const rawHtml = editor.getHTML();
    const sampleData: Record<string, string | undefined> = {
      "{{firstName}}": "John",
      "{{lastName}}": "Doe",
      "{{fullName}}": "John Doe",
      "{{email}}": "john.doe@example.com",
      "{{location}}": "London, UK",
      "{{topSkill}}": "PLC Programming",
      "{{skills}}": "PLC Programming, SCADA, HMI Design",
      "{{jobTitle}}": "Automation Engineer",
      "{{jobLocation}}": "Manchester, UK",
      "{{jobSalary}}": "\u00a345,000 - \u00a355,000",
      "{{jobCompany}}": "Acme Automation Ltd",
      "{{jobType}}": "Permanent",
      "{{companyName}}": "Acme Automation Ltd",
      "{{contactName}}": "Jane Smith",
      "{{senderName}}": senderName ?? "OSCABE Recruiter",
      "{{senderEmail}}": senderEmail ?? "recruiter@oscabe.com",
      "{{unsubscribeLink}}": "#",
      ...tokenData,
    };
    const replaced = replaceTokens(rawHtml, sampleData);
    return wrapEmailHtml(replaced, subject || "Email Preview");
  }, [mode, editor, tokenData, senderName, senderEmail, subject]);

  // -------------------------------------------------------------------------
  // Send handler
  // -------------------------------------------------------------------------

  const handleSend = async () => {
    if (!editor || sending) return;
    setSending(true);
    try {
      await onSend({
        to: recipients,
        subject,
        body: editor.getHTML(),
        sendVia,
      });
    } finally {
      setSending(false);
    }
  };

  // -------------------------------------------------------------------------
  // Token dropdown grouped entries
  // -------------------------------------------------------------------------

  const groupedTokens = useMemo(() => {
    const groups: Record<string, { token: string; description: string }[]> = {};
    for (const [token, description] of Object.entries(AVAILABLE_TOKENS)) {
      const group = getTokenGroup(token);
      if (!groups[group]) groups[group] = [];
      groups[group].push({ token, description });
    }
    return groups;
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background overflow-hidden">
      {/* Header / metadata */}
      <div className="flex flex-col gap-3 p-4 border-b bg-muted/30">
        {/* Send from selector */}
        <div className="flex items-center gap-2 text-sm">
          <Label className="w-14 text-muted-foreground shrink-0">From</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSendVia("resend")}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                sendVia === "resend"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              OSCABE (noreply@oscabe.com)
            </button>
            {microsoftConnected && (
              <button
                type="button"
                onClick={() => setSendVia("outlook")}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sendVia === "outlook"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Your Outlook {microsoftEmail ? `(${microsoftEmail})` : ""}
              </button>
            )}
          </div>
        </div>

        {/* To */}
        <div className="flex items-center gap-2 text-sm">
          <Label className="w-14 text-muted-foreground shrink-0">To</Label>
          {recipients.length === 1 ? (
            <span className="text-foreground">{recipients[0]}</span>
          ) : (
            <Badge variant="secondary">{recipientLabel}</Badge>
          )}
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2 text-sm">
          <Label className="w-14 text-muted-foreground shrink-0">Subject</Label>
          <div className="flex flex-1 items-center gap-1">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="flex-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background px-2.5 py-1 text-[0.8rem] font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground h-7"
              >
                Token
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                {Object.entries(groupedTokens).map(([group, tokens], gi) => (
                  <div key={group}>
                    {gi > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{group}</DropdownMenuLabel>
                    {tokens.map(({ token, description }) => (
                      <DropdownMenuItem
                        key={token}
                        onClick={() => insertTokenInSubject(token)}
                      >
                        <span className="font-mono text-xs">{token}</span>
                        <span className="ml-2 text-muted-foreground text-xs">{description}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 px-4 py-2 border-b">
        <Button
          variant={mode === "edit" ? "secondary" : "ghost"}
          size="sm"
          type="button"
          onClick={() => setMode("edit")}
        >
          Edit
        </Button>
        <Button
          variant={mode === "preview" ? "secondary" : "ghost"}
          size="sm"
          type="button"
          onClick={() => setMode("preview")}
        >
          Preview
        </Button>
      </div>

      {/* Editor or Preview */}
      {mode === "edit" ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b bg-muted/20">
            {/* Bold */}
            <Button
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <span className="font-bold text-xs">B</span>
            </Button>

            {/* Italic */}
            <Button
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <span className="italic text-xs">I</span>
            </Button>

            {/* Underline */}
            <Button
              variant={editor.isActive("underline") ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <span className="underline text-xs">U</span>
            </Button>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Link */}
            <Button
              variant={editor.isActive("link") ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={setLink}
              title="Link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </Button>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Bullet list */}
            <Button
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </Button>

            {/* Ordered list */}
            <Button
              variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
                <path d="M4 6h1v4" />
                <path d="M4 10h2" />
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
              </svg>
            </Button>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Text align */}
            <Button
              variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="Align Left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <line x1="17" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="17" y1="18" x2="3" y2="18" />
              </svg>
            </Button>

            <Button
              variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              title="Align Center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <line x1="18" y1="10" x2="6" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="18" y1="18" x2="6" y2="18" />
              </svg>
            </Button>

            <Button
              variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
              size="icon-sm"
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="Align Right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <line x1="21" y1="10" x2="7" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="7" y2="18" />
              </svg>
            </Button>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Insert Token dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background px-2.5 py-1 text-[0.8rem] font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground h-7"
              >
                Insert Token &#x25BE;
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4}>
                {Object.entries(groupedTokens).map(([group, tokens], gi) => (
                  <div key={group}>
                    {gi > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{group}</DropdownMenuLabel>
                    {tokens.map(({ token, description }) => (
                      <DropdownMenuItem
                        key={token}
                        onClick={() => insertToken(token)}
                      >
                        <span className="font-mono text-xs">{token}</span>
                        <span className="ml-2 text-muted-foreground text-xs truncate">
                          {description}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-y-auto">
            <style>{`
              .ProseMirror {
                min-height: 300px;
                outline: none;
              }
              .ProseMirror p.is-editor-empty:first-child::before {
                color: #adb5bd;
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
              }
              .ProseMirror ul {
                list-style-type: disc;
                padding-left: 1.5em;
              }
              .ProseMirror ol {
                list-style-type: decimal;
                padding-left: 1.5em;
              }
              .ProseMirror a {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
              }
              .ProseMirror p {
                margin: 0.25em 0;
              }
              .ProseMirror:focus {
                outline: none;
              }
            `}</style>
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        /* Preview mode */
        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            title="Email preview"
            className="w-full h-full min-h-[400px] border-0"
            sandbox="allow-same-origin"
          />
        </div>
      )}

      {/* Footer: stats + actions */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20">
        <div className="text-xs text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"} &middot; {charCount}{" "}
          {charCount === 1 ? "character" : "characters"}
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            type="button"
            onClick={handleSend}
            disabled={sending || !subject.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

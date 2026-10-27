import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const BoldIcon    = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const ItalicIcon  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const ULIcon      = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>;
const OLIcon      = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="1" y="9" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">1</text><text x="1" y="15" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">2</text><text x="1" y="21" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">3</text></svg>;
const UndoIcon    = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>;
const UnderlineIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const StrikeIcon  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>;
const QuoteIcon   = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M7 7h4v4c0 3-1.5 5-4 6l-.8-1.4C7.8 14.8 8.5 13.6 8.6 12H7zM14 7h4v4c0 3-1.5 5-4 6l-.8-1.4c1.6-.8 2.3-2 2.4-3.6H14z"/></svg>;
const LinkIcon    = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const HrIcon      = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>;
const ClearIcon   = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><line x1="9" y1="20" x2="13" y2="20"/><line x1="12" y1="4" x2="8" y2="20"/><line x1="3" y1="3" x2="21" y2="21"/></svg>;
const RedoIcon    = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>;

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      className={`rich-toolbar-btn${active ? ' is-active' : ''}`}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
    >
      {children}
    </button>
  );
}

function setLink(editor) {
  const prev = editor.getAttributes('link').href || '';
  const url = window.prompt('Посилання (залиште порожнім, щоб прибрати):', prev);
  if (url === null) return;
  if (url.trim() === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
}

function Toolbar({ editor, extended }) {
  if (!editor) return null;
  return (
    <div className="rich-toolbar">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Жирний">
        <BoldIcon />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Курсив">
        <ItalicIcon />
      </ToolbarBtn>
      {extended && (
        <>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Підкреслений">
            <UnderlineIcon />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Закреслений">
            <StrikeIcon />
          </ToolbarBtn>
          <div className="rich-toolbar-sep" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Заголовок">
            <span className="rich-toolbar-text">H2</span>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Підзаголовок">
            <span className="rich-toolbar-text">H3</span>
          </ToolbarBtn>
        </>
      )}
      <div className="rich-toolbar-sep" />
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Маркований список">
        <ULIcon />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Нумерований список">
        <OLIcon />
      </ToolbarBtn>
      {extended && (
        <>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Цитата">
            <QuoteIcon />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Розділювач">
            <HrIcon />
          </ToolbarBtn>
          <div className="rich-toolbar-sep" />
          <ToolbarBtn onClick={() => setLink(editor)} active={editor.isActive('link')} title="Посилання">
            <LinkIcon />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} active={false} title="Очистити форматування">
            <ClearIcon />
          </ToolbarBtn>
        </>
      )}
      <div className="rich-toolbar-sep" />
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Відмінити">
        <UndoIcon />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Повторити">
        <RedoIcon />
      </ToolbarBtn>
    </div>
  );
}

function RichEditor({ value, onChange, extended = false }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          defaultProtocol: 'https',
          HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
        },
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="rich-editor">
      <Toolbar editor={editor} extended={extended} />
      <EditorContent editor={editor} className="rich-editor-content" />
    </div>
  );
}

export default RichEditor;

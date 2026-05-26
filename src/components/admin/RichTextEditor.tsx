import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Link, Image as ImageIcon, Youtube, Loader, Wand2, Monitor, Code2, Copy, Check } from 'lucide-react';
import { supabase } from '../../supabase';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateAi?: (prompt: string) => Promise<string|void>;
  isGeneratingAi?: boolean;
  forcePreviewTrigger?: number;
  isFullScreen?: boolean;
}

export function RichTextEditor({ value, onChange, onGenerateAi, isGeneratingAi, forcePreviewTrigger, isFullScreen }: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const [isCopied, setIsCopied] = useState(false);

  // Automatically switch to preview mode when triggered (e.g. after AI refinement)
  useEffect(() => {
    if (forcePreviewTrigger !== undefined && forcePreviewTrigger > 0) {
      setIsHtmlMode(false);
    }
  }, [forcePreviewTrigger]);

  const prevIsGeneratingRef = useRef(isGeneratingAi);

  // Sync external value changes into local state & contentEditable
  useEffect(() => {
    if (!isHtmlMode && editorRef.current && document.activeElement !== editorRef.current) {
       if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || '';
       }
    }
    setLocalValue(value || '');
  }, [value, isHtmlMode]);

  const handleEditorInput = () => {
    if (editorRef.current) {
       const html = editorRef.current.innerHTML;
       setLocalValue(html);
       onChange(html);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    onChange(val);
  };

  const execCmd = (cmd: string, val?: string) => {
    if (isHtmlMode) {
       // Insert into textarea at cursor position
       if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const text = textareaRef.current.value;
          let insert = '';
          
          if (cmd === 'bold') insert = `<b>${text.substring(start, end) || '강조'}</b>`;
          else if (cmd === 'italic') insert = `<i>${text.substring(start, end) || '기울게'}</i>`;
          else if (cmd === 'createLink') insert = `<a href="${val||'#'}" class="text-brand-primary underline">${text.substring(start, end) || '링크'}</a>`;
          else if (cmd === 'insertImage') insert = `\n<img src="${val}" alt="image" class="w-full rounded-xl my-4 object-cover" />\n`;
          else if (cmd === 'insertYoutube') insert = `\n<div class="aspect-w-16 aspect-h-9 my-4"><iframe src="${val}" frameborder="0" class="w-full h-64 rounded-xl" allowfullscreen></iframe></div>\n`;
          else if (cmd === 'fontSize') insert = `<span style="font-size: 24px;">${text.substring(start, end) || '큰 글씨'}</span>`;
          else if (cmd === 'foreColor') insert = `<span style="color: ${val};">${text.substring(start, end) || '색상 텍스트'}</span>`;

          if (insert) {
             const newHtml = text.substring(0, start) + insert + text.substring(end);
             setLocalValue(newHtml);
             onChange(newHtml);
             
             setTimeout(() => {
                if (textareaRef.current) {
                   textareaRef.current.focus();
                   textareaRef.current.setSelectionRange(start + insert.length, start + insert.length);
                }
             }, 0);
          }
       }
    } else {
       // Insert into contentEditable
       if (cmd === 'insertYoutube') {
          const embed = `<div class="aspect-w-16 aspect-h-9 my-4"><iframe src="${val}" frameborder="0" class="w-full h-64 rounded-xl" contenteditable="false" allowfullscreen></iframe></div><p><br></p>`;
          document.execCommand('insertHTML', false, embed);
       } else if (cmd === 'insertImage') {
          const img = `<img src="${val}" alt="image" class="w-full rounded-xl my-4 object-cover" style="max-width: 100%; height: auto;" /><p><br></p>`;
          document.execCommand('insertHTML', false, img);
       } else {
          document.execCommand(cmd, false, val);
       }
       if (editorRef.current) {
         editorRef.current.focus();
       }
       handleEditorInput();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertImg = () => {
     if (fileInputRef.current) {
        fileInputRef.current.click();
     }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     // Reset input so the same file can be selected again
     e.target.value = '';

     setIsUploading(true);
     try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `editor-images/${fileName}`;

        const { error } = await supabase.storage.from('models').upload(filePath, file, {
           cacheControl: '3600',
           upsert: false
        });

        if (error) throw error;

        const { data: urlData } = supabase.storage.from('models').getPublicUrl(filePath);
        if (urlData?.publicUrl) {
           execCmd('insertImage', urlData.publicUrl);
        } else {
           alert('이미지 업로드에 실패했습니다.');
        }
     } catch (err) {
        console.error('Image upload error:', err);
        alert('이미지 업로드 중 오류가 발생했습니다.');
     } finally {
        setIsUploading(false);
     }
  };

  const insertLink = () => {
     const url = window.prompt("링크 URL을 입력하세요:");
     if (url) execCmd('createLink', url);
  };

  const insertVideo = () => {
     const url = window.prompt("유튜브 임베드 URL을 입력하세요: (예: https://www.youtube.com/embed/...)");
     if (url) execCmd('insertYoutube', url);
  };

  const handleAi = async () => {
     if (!onGenerateAi) return;
     let prompt = "";
     let savedRange: Range | null = null;

     if (isHtmlMode) {
        if (textareaRef.current) {
           const start = textareaRef.current.selectionStart;
           const end = textareaRef.current.selectionEnd;
           if (start !== end) prompt = textareaRef.current.value.substring(start, end);
        }
     } else {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
           savedRange = selection.getRangeAt(0);
           if (selection.toString()) {
              prompt = selection.toString();
           }
        }
     }
     
     const generated = await onGenerateAi(prompt);
     if (generated) {
        if (isHtmlMode) {
           if (textareaRef.current) {
              const start = textareaRef.current.selectionStart;
              const end = textareaRef.current.selectionEnd;
              const text = textareaRef.current.value;
              const newHtml = text.substring(0, start) + generated + text.substring(end);
              setLocalValue(newHtml);
              onChange(newHtml);
           }
        } else {
           if (editorRef.current) editorRef.current.focus();
           if (savedRange) {
              const selection = window.getSelection();
              selection?.removeAllRanges();
              selection?.addRange(savedRange);
           }
           
           // If document activeElement is the editor, execCommand should work
           const success = document.execCommand('insertHTML', false, generated);
           
           // Fallback if execCommand fails
           if (!success && editorRef.current) {
               const newHtml = editorRef.current.innerHTML + generated;
               editorRef.current.innerHTML = newHtml;
           }
           handleEditorInput();
        }
     }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localValue);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col overflow-hidden transition-all ${isFullScreen ? 'flex-1 h-full' : 'border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-primary shadow-sm hover:shadow-md'} ${isHtmlMode ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
       <input 
         type="file" 
         ref={fileInputRef} 
         onChange={handleFileUpload} 
         accept="image/*" 
         className="hidden" 
       />
       <div className={`${isHtmlMode ? 'bg-[#252526] border-[#333333]' : 'bg-gray-50 border-gray-200'} border-b flex flex-wrap items-center justify-between gap-2 p-3 transition-colors shrink-0`}>
          <div className="flex flex-wrap items-center gap-1">
             {!isHtmlMode ? (
               <>
                 <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('bold')} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-gray-600 hover:bg-gray-200 hover:text-gray-900" title="굵게"><Bold className="w-4 h-4"/></button>
                 <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('italic')} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-gray-600 hover:bg-gray-200 hover:text-gray-900" title="기울임"><Italic className="w-4 h-4"/></button>
                 <div className="w-px h-5 mx-2 bg-gray-300" />
                 <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('fontSize', '5')} className="h-8 px-2 flex items-center justify-center rounded-lg transition-colors text-xs font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-900" title="큰 글씨">가A</button>
                 <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('foreColor', '#4f46e5')} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-xs font-bold text-indigo-500 hover:bg-indigo-50" title="색상 텍스트">A</button>
                 <div className="w-px h-5 mx-2 bg-gray-300" />
                 <button onMouseDown={(e) => e.preventDefault()} onClick={insertLink} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-gray-600 hover:bg-gray-200 hover:text-gray-900" title="링크 추가"><Link className="w-4 h-4"/></button>
                 <button onMouseDown={(e) => e.preventDefault()} onClick={insertImg} disabled={isUploading} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 text-gray-600 hover:bg-gray-200 hover:text-gray-900" title="이미지 추가">
                   {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4"/>}
                 </button>
                 <button onMouseDown={(e) => e.preventDefault()} onClick={insertVideo} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-gray-600 hover:bg-gray-200 hover:text-gray-900" title="유튜브 추가"><Youtube className="w-4 h-4"/></button>
               </>
             ) : (
               <div className="flex items-center gap-3 px-2">
                 <div className="flex items-center gap-2 text-indigo-400">
                    <Code2 className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">HTML SOURCE MODE</span>
                 </div>
                 <div className="w-px h-4 bg-[#3e3e42]" />
                 <span className="text-[10px] text-gray-500 font-medium">코드를 직접 수정하여 디자인을 완성하세요.</span>
               </div>
             )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <button 
                onClick={handleAi}
                disabled={isGeneratingAi}
                className="text-xs font-bold text-white bg-brand-primary px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-brand-primary/90 transition-colors shadow-sm disabled:opacity-50"
             >
                {isGeneratingAi ? <><Loader className="w-3.5 h-3.5 animate-spin" /> 생성 중...</> : <><Wand2 className="w-3.5 h-3.5" /> AI 콘텐츠 생성</>}
             </button>
             
             <div className={`flex rounded-lg p-1 border transition-colors ${isHtmlMode ? 'bg-[#37373d] border-[#4b4b4b]' : 'bg-gray-200/80 border-gray-300/50'}`}>
                <button 
                   onClick={() => setIsHtmlMode(false)} 
                   className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${!isHtmlMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                   <Monitor className="w-3.5 h-3.5" />
                   미리보기
                </button>
                <button 
                   onClick={() => setIsHtmlMode(true)} 
                   className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${isHtmlMode ? 'bg-[#1e1e1e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <Code2 className="w-3.5 h-3.5" />
                   HTML 소스
                </button>
             </div>
          </div>
       </div>
       
       <div className={`relative flex-1 flex flex-col min-h-[500px] ${isHtmlMode ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
          {isHtmlMode ? (
             <div key="html-editor-container" className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between border-b border-[#3e3e42] shrink-0">
                   <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] font-mono">source_mode.html</span>
                   </div>
                   <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#37373d] hover:bg-[#45454d] text-gray-300 hover:text-white rounded text-[10px] font-bold border border-[#4b4b4b] transition-all"
                   >
                      {isCopied ? <><Check className="w-3 h-3 text-emerald-400" /> 복사 완료</> : <><Copy className="w-3 h-3" /> 코드 복사</>}
                   </button>
                </div>
                <div className="flex-1 code-editor-dark overflow-auto custom-scrollbar-dark min-h-0">
                   <Editor
                      value={localValue}
                      onValueChange={code => {
                         setLocalValue(code);
                         onChange(code);
                      }}
                      highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
                      padding={32}
                      className="min-h-full font-mono"
                      style={{
                         fontSize: 14,
                         lineHeight: '1.6',
                      }}
                      textareaId="html-editor-textarea"
                      textareaClassName="outline-none"
                   />
                </div>
             </div>
          ) : (
             <div 
               key="visual-editor-container"
               ref={editorRef}
               contentEditable
               className="w-full h-full p-12 outline-none prose max-w-none focus:ring-0 overflow-auto prose-img:rounded-2xl prose-img:shadow-md prose-img:my-6 prose-headings:text-gray-900 prose-p:text-gray-600 leading-relaxed transition-all"
               onInput={handleEditorInput}
               onBlur={handleEditorInput}
               suppressContentEditableWarning
             />
          )}
       </div>
    </div>
  );
}

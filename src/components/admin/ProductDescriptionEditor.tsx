"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProductImagesAction } from "@/app/admin/actions";

type MediaItem = { id: string; filename: string };

function initialHtml(value: string) {
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function ProductDescriptionEditor({ value, media }: { value: string; media: MediaItem[] }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const markerIdRef = useRef<string | null>(null);
  const [html, setHtml] = useState(() => initialHtml(value));
  const [items, setItems] = useState(media);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    setHtml(editorRef.current?.innerHTML || "");
  }

  function markSelection() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll("[data-image-marker]").forEach((marker) => marker.remove());
    const selection = window.getSelection();
    const markerId = `image-marker-${Date.now()}`;
    const marker = document.createElement("span");
    marker.id = markerId;
    marker.dataset.imageMarker = "true";
    marker.textContent = "\u200b";

    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0).cloneRange();
      if (editor.contains(range.commonAncestorContainer)) {
        range.collapse(true);
        range.insertNode(marker);
      } else {
        editor.appendChild(marker);
      }
    } else {
      editor.appendChild(marker);
    }
    markerIdRef.current = markerId;
    setHtml(editor.innerHTML);
  }

  function insertImage(src: string) {
    const editor = editorRef.current;
    if (!editor) return;
    const marker = markerIdRef.current
      ? editor.querySelector<HTMLElement>(`#${markerIdRef.current}`)
      : null;
    const imageBlock = document.createElement("p");
    imageBlock.innerHTML = `<img src="${src}" alt="Ảnh mô tả sản phẩm" style="max-width:100%;height:auto" />`;
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";

    if (marker) {
      marker.replaceWith(imageBlock, paragraph);
    } else {
      editor.append(imageBlock, paragraph);
    }
    markerIdRef.current = null;
    setHtml(editor.innerHTML);
    setShowImageMenu(false);
    setShowLibrary(false);
    requestAnimationFrame(() => {
      editor.focus();
      const range = document.createRange();
      range.selectNodeContents(paragraph);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  }

  const toolClass = "min-w-9 rounded border border-line bg-white px-2 py-1.5 text-sm font-medium hover:border-[#ee4d2d] hover:text-[#ee4d2d]";

  return (
    <div className="relative">
      <input type="hidden" name="description" value={html} />
      <div className="flex flex-wrap items-center gap-1 rounded-t border border-line bg-[#f7f7f7] p-2">
        <button type="button" className={toolClass} onClick={() => run("bold")} title="In đậm"><strong>B</strong></button>
        <button type="button" className={toolClass} onClick={() => run("italic")} title="In nghiêng"><em>I</em></button>
        <button type="button" className={toolClass} onClick={() => run("underline")} title="Gạch chân"><u>U</u></button>
        <select className="rounded border border-line bg-white px-2 py-1.5" defaultValue="p" onChange={(event) => run("formatBlock", event.target.value)} aria-label="Kiểu chữ">
          <option value="p">Văn bản</option><option value="h2">Tiêu đề lớn</option><option value="h3">Tiêu đề nhỏ</option>
        </select>
        <select className="rounded border border-line bg-white px-2 py-1.5" defaultValue="3" onChange={(event) => run("fontSize", event.target.value)} aria-label="Cỡ chữ">
          <option value="2">Nhỏ</option><option value="3">Bình thường</option><option value="4">Lớn</option><option value="5">Rất lớn</option>
        </select>
        <button type="button" className={toolClass} onClick={() => run("insertUnorderedList")} title="Danh sách">• List</button>
        <button type="button" className={toolClass} onClick={() => run("insertOrderedList")} title="Danh sách số">1. List</button>
        <button type="button" className={toolClass} onClick={() => run("justifyLeft")} title="Căn trái">≡</button>
        <button type="button" className={toolClass} onClick={() => run("justifyCenter")} title="Căn giữa">≡</button>
        <button type="button" className={toolClass} onClick={() => run("createLink", prompt("Nhập đường dẫn") || "")} title="Chèn liên kết">🔗</button>
        <div className="relative">
          <button type="button" className="rounded bg-[#ee4d2d] px-3 py-1.5 font-semibold text-white" onMouseDown={(event) => { event.preventDefault(); markSelection(); }} onClick={() => setShowImageMenu((open) => !open)}>▧ Chèn ảnh</button>
          {showImageMenu && (
            <div className="absolute left-0 top-full z-30 mt-1 w-48 rounded border border-line bg-white p-1 shadow-lg">
              <button type="button" className="block w-full rounded px-3 py-2 text-left hover:bg-[#fff2ef]" onClick={() => setShowLibrary(true)}>Chọn từ thư viện</button>
              <label className="block cursor-pointer rounded px-3 py-2 hover:bg-[#fff2ef]">
                {pending ? "Đang tải..." : "Chọn từ máy"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={pending} className="sr-only" onChange={(event) => {
                  const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
                  startTransition(async () => {
                    const data = new FormData(); data.append("images", file);
                    const result = await uploadProductImagesAction(data);
                    if (result.ok) {
                      const id = result.urls[0].split("/").pop() || "";
                      setItems((current) => [{ id, filename: file.name }, ...current]);
                      insertImage(result.urls[0]);
                    }
                  });
                }} />
              </label>
            </div>
          )}
        </div>
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={() => setHtml(editorRef.current?.innerHTML || "")} dangerouslySetInnerHTML={{ __html: html }} className="min-h-[360px] overflow-y-auto rounded-b border-x border-b border-line bg-white px-4 py-3 text-base leading-7 outline-none focus:border-[#ee4d2d] [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-2 [&_h3]:text-xl [&_h3]:font-bold [&_img]:my-4 [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6" />

      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={() => setShowLibrary(false)}>
          <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4"><h3 className="text-xl font-bold">Chọn ảnh từ Thư viện Media</h3><button type="button" onClick={() => setShowLibrary(false)} className="text-2xl">×</button></div>
            <div className="grid max-h-[65vh] grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => <button type="button" key={item.id} onClick={() => insertImage(`/api/media/${item.id}`)} className="overflow-hidden rounded border border-line text-left hover:border-[#ee4d2d]">
                {/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/media/${item.id}`} alt={item.filename} className="aspect-square w-full object-cover" /><span className="block truncate p-2 text-xs">{item.filename}</span>
              </button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

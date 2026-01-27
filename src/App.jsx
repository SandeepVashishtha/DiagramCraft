import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript"; // REQUIRED

import * as htmlToImage from "html-to-image";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
});

const initialDiagram = `flowchart TB
A[Sensing Layer] --> B[Edge Layer]
B --> C[Communication Layer]
C --> D[Cloud Layer]
D --> E[Application Layer]
E --> B`;

export default function App() {
  const editorRef = useRef(null);
  const diagramRef = useRef(null);
  const editorInstance = useRef(null);

  useEffect(() => {
    // Prevent double init (React StrictMode)
    if (editorInstance.current) return;

    editorInstance.current = CodeMirror(editorRef.current, {
      value: initialDiagram,
      mode: "text/plain",
      lineNumbers: true,
    });

    renderDiagram(initialDiagram);
  }, []);

  const renderDiagram = async (code) => {
    try {
      const { svg } = await mermaid.render(
        "diagram_" + Date.now(),
        code
      );
      diagramRef.current.innerHTML = svg;
    } catch (err) {
      diagramRef.current.innerHTML = `
        <pre style="color:red; white-space:pre-wrap;">
${err.message}
        </pre>`;
    }
  };

  const handleRenderClick = () => {
    const code = editorInstance.current.getValue();
    renderDiagram(code);
  };

  const downloadSVG = () => {
    const svg = diagramRef.current.querySelector("svg");
    if (!svg) return alert("Render diagram first");

    const blob = new Blob([svg.outerHTML], {
      type: "image/svg+xml",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "diagram.svg";
    a.click();
  };

  const downloadPNG = () => {
    htmlToImage.toPng(diagramRef.current).then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "diagram.png";
      a.click();
    });
  };

  return (
    <div className="app-container">
      {/* Top Floating Toolbar */}
      <div className="floating-toolbar">
        <div className="toolbar-content">
          <h1 className="app-title">DiagramCraft</h1>
          <div className="toolbar-actions">
            <button className="btn-primary" onClick={handleRenderClick}>
              Render
            </button>
            <button className="btn-secondary" onClick={downloadSVG}>
              Download SVG
            </button>
            <button className="btn-secondary" onClick={downloadPNG}>
              Download PNG
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Panel - Editor */}
        <div className="left-panel">
          <div className="editor" ref={editorRef}></div>
          
          <div className="samples-section">
            <div className="samples-header">Sample Diagrams</div>
            <div className="samples-grid">
              <button className="sample-btn">Flowchart</button>
              <button className="sample-btn">Sequence</button>
              <button className="sample-btn">Class</button>
              <button className="sample-btn">State</button>
            </div>
          </div>
        </div>

        {/* Right Panel - Diagram Canvas */}
        <div className="right-panel">
          <div className="diagram" ref={diagramRef}></div>
        </div>
      </div>
    </div>
  );
}

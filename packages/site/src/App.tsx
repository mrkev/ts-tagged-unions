import "./App.css";
// App.tsx
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import useLocalStorage from "use-local-storage";
import { tryParse } from "../../ts-tagged-unions/src/index";

export function App() {
  const [source, setSource] = useState("// Type your code here...");
  const [parseResult, setParseResult] = useState("// Type your code here...");
  const [logs, setLogs] = useState<string>("");
  const [savedSnippets] = useLocalStorage("ts-tagged-unions.savedSnippets", [
    { id: 1, name: "saved typescript code 1", code: "// snippet 1" },
    { id: 2, name: "saved typescript code 2", code: "// snippet 2" },
  ]);

  const onRun = () => {
    try {
      setLogs("");
      const result = tryParse(source);
      setParseResult(JSON.stringify(result, null, 2));
    } catch (e) {
      setLogs((e as any).message);
    }
  };

  const onSave = () => {};

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <div className="w-48 border-r p-2 flex flex-col gap-2">
        {savedSnippets.map((s) => (
          <button key={s.id} className="p-2 text-left border rounded">
            {s.name}
          </button>
        ))}
      </div>

      {/* Main content split: editors (left) + results (right) */}
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50}>
          {/* Top toolbar + editor + logs */}
          <PanelGroup direction="vertical">
            <Panel defaultSize={50}>
              {/* Toolbar */}
              <div className="flex gap-2 p-2 border-b">
                <button className="px-3 py-1 border rounded" onClick={onRun}>
                  Parse
                </button>
                <button className="px-3 py-1 border rounded" onClick={onSave}>
                  Save
                </button>
              </div>

              {/* Source Editor */}
              <Editor
                theme="vs-dark"
                height="100%"
                defaultLanguage="typescript"
                value={source}
                onChange={(val) => setSource(val ?? "")}
                options={{ minimap: { enabled: false } }}
              />
            </Panel>

            <PanelResizeHandle className="h-1 hover:bg-gray-500 transition-colors" />

            <Panel defaultSize={20}>
              {/* Logs Panel */}
              <pre className="p-2 font-mono text-sm overflow-auto h-full">
                {logs}
              </pre>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 hover:bg-gray-500 transition-colors" />

        <Panel defaultSize={30}>
          {/* Result Editor (read-only) */}
          <Editor
            theme="vs-dark"
            height="100%"
            defaultLanguage="typescript"
            value={parseResult}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

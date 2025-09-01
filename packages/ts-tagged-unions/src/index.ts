import ts from "typescript/lib/tsserverlibrary";

export default function init() {
  // modules: { typescript: typeof ts }
  // const ts = modules.typescript;
  // console.log("hello", ts);

  return {
    create(info: ts.server.PluginCreateInfo) {
      info.project.projectService.logger.info("My plugin is initializing.");

      const prefix = (info.config as any).prefix ?? "[MyTSPlugin] ";

      // Wrap existing language service
      const oldGetQuickInfoAtPosition =
        info.languageService.getQuickInfoAtPosition;

      info.languageService.getQuickInfoAtPosition = (fileName, position) => {
        const prior = oldGetQuickInfoAtPosition(fileName, position);

        if (prior) {
          // Add a prefix to hover tooltips
          prior.displayParts = [
            { text: prefix, kind: "text" },
            ...(prior.displayParts ?? []),
          ];
        }
        return prior;
      };

      return info.languageService;
    },
  };
}

// export = init;

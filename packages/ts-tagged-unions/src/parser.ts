import * as Parsimmon from "parsimmon";
import { Node, withAt } from "./Node";

export type LangType = {
  _: string[];
  __: string;
  _comma: string;
  _semi: string;
  _nl: string;
  __nl: string;

  Identifier: Node<{ kind: "Identifier"; value: string }>;
  ConstructorList: Node<{
    kind: "ConstructorList";
    identifiers: LangType["Identifier"][];
  }>;
};

export const Lang = Parsimmon.createLanguage<LangType>({
  _: (r) => {
    return Parsimmon.alt(Parsimmon.whitespace).many().desc("optional space");
  },
  __: () => {
    return Parsimmon.whitespace.desc("required whitespace");
  },
  _comma: (r) => {
    return Parsimmon.string(",").trim(r._).desc("comma");
  },
  _semi: (r) => {
    return Parsimmon.string(";").trim(r._).desc("semi");
  },
  _nl: (r) => {
    return Parsimmon.regex(/[\s;]*/)
      .trim(r._)
      .desc("optional newline");
  },
  __nl: (r) => {
    return Parsimmon.alt(Parsimmon.string(";"), Parsimmon.string("\n"))
      .trim(r._)
      .desc("requried newline");
  },

  Identifier: () => {
    return withAt(
      Parsimmon.regexp(
        /(?!string|number|boolean|object|array|true|false|null|import)[a-z][a-zA-Z0-9]*/
      )
        .desc("Identifier")
        .map((value) => ({
          kind: "Identifier",
          value: value,
        }))
    );
  },

  // King; Queen; ...etc
  ConstructorList: (r) => {
    return withAt(
      Parsimmon.seqMap(
        r.Identifier.sepBy(r._semi.trim(r._)),
        function (identifiers) {
          return {
            kind: "ConstructorList",
            identifiers,
          };
        }
      )
    );
  },
});

export function tryParse(str: string): LangType["ConstructorList"] {
  const result = Lang.ConstructorList.tryParse(str);
  return result;
}

// From: https://github.com/jneen/parsimmon/blob/master/examples/json.js

// Use the JSON standard's definition of whitespace rather than Parsimmon's.
const whitespace = Parsimmon.regexp(/\s*/m);

// JSON is pretty relaxed about whitespace, so let's make it easy to ignore
// after most text.
function token<T>(parser: Parsimmon.Parser<T>) {
  return parser.skip(whitespace);
}

// Turn escaped characters into real ones (e.g. "\\n" becomes "\n").
function interpretEscapes(str: string) {
  const escapes = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape: string) => {
    const type = escape.charAt(0);
    const hex = escape.slice(1);
    if (type === "u") {
      return String.fromCharCode(parseInt(hex, 16));
    }
    // eslint-disable-next-line no-prototype-builtins
    if (escapes.hasOwnProperty(type)) {
      return (escapes as any)[type];
    }
    return type;
  });
}

// function makeNode<U>(parser: Parsimmon.Parser<U>) {
//   return Parsimmon.seqMap(
//     Parsimmon.index,
//     parser,
//     Parsimmon.index,
//     function (start, value, end) {
//       return Object.freeze({
//         type: "myLanguage." + name,
//         value: value,
//         start: start,
//         end: end,
//       });
//     }
//   );
// }

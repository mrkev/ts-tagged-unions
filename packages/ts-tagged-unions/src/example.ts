function adt(foo: TemplateStringsArray, ...values: string[]): any {}

function match(foo: TemplateStringsArray, ...values: any[]) {}

const Card = adt`
  King;
  Queen;
  Jack;
  Number(value: number);
`;

const four = Card.Number(4);

const nameStr = match`${four} with
  King | Queen | Jack => "Royal";
  Number(value) => {
    return "Number";  
  }
`;

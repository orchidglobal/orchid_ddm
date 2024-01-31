declare module 'translator' {
  function Translator (value: string, parameters: Record<string, any>): Promise<string>;
  export default Translator;
}

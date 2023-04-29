type Whitespace = ' ' | '\n' | '\r' | '\t'

type TrimStart<S extends string, P extends string = Whitespace> = S extends `${P}${infer R}` ? TrimStart<R, P> : S

type TrimEnd<S extends string, P extends string = Whitespace> = S extends `${infer R}${P}` ? TrimEnd<R, P> : S

type Trim<S extends string, P extends string = Whitespace> = S extends `${P}${infer R}` ? Trim<R, P> : S extends `${infer R}${P}` ? Trim<R, P> : S

type ReplaceOnce<Search extends string, Replace extends string, Subject extends string> = Subject extends `${infer L}${Search}${infer R}` ? `${L}${Replace}${R}` : Subject

type ReplaceAll<Search extends string, Replace extends string, Subject extends string> = Subject extends `${infer L}${Search}${infer R}` ? ReplaceAll<Search, Replace, `${L}${Replace}${R}`> : Subject

type Includes<S extends string, P extends string> = S extends `${infer L}${P}${infer R}` ? true : false

/----- Test -----/

type TS1 = TrimStart<'01234'>
type TS2 = TrimStart<'   aa'>
type TS3 = TrimStart<'aa   '>
type TS4 = TrimStart<' aaa '>

type TE1 = TrimEnd<'01234'>
type TE2 = TrimEnd<'   aa'>
type TE3 = TrimEnd<'aa   '>
type TE4 = TrimEnd<' aaa '>

type T1 = Trim<'01234'>
type T2 = Trim<'   aa'>
type T3 = Trim<'aa   '>
type T4 = Trim<' aaa '>

type RO1 = ReplaceOnce<'a', '1', 'abcde abcde'>
type RO2 = ReplaceOnce<'a', '1', '54321 54321'>

type RA1 = ReplaceAll<'a', '1', 'abcde abcde'>
type RA2 = ReplaceAll<'a', '1', '54321 54321'>

type In1 = Includes<'abcdefg', 'a'>
type In2 = Includes<'abcdefg', '1'>

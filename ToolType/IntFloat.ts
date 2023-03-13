type HasDot<T extends string> = T extends `${infer Head}${infer Tail}` ? (Head extends '.' ? true : HasDot<Tail>) : T extends `${infer Single}` ? (Single extends '.' ? true : false) : never

type Int<T extends number> = `${T}` extends infer R ? (R extends string ? (HasDot<R> extends false ? T : never) : never) : never

type Float<T extends number> = `${T}` extends infer R ? (R extends string ? (HasDot<R> extends true ? T : never) : never) : never

type H1 = HasDot<'123'>
type H2 = HasDot<'1.2'>
type H3 = HasDot<'1.0'>
type H4 = HasDot<'0'>
type H5 = HasDot<'-123'>
type H6 = HasDot<'-1.2'>
type H7 = HasDot<'-1.0'>
type H8 = HasDot<'-0'>

type I1 = Int<123>
type I2 = Int<1.2>
type I3 = Int<1.0>
type I4 = Int<0>
type I5 = Int<-123>
type I6 = Int<-1.2>
type I7 = Int<-1.0>
type I8 = Int<-0>

type F1 = Float<123>
type F2 = Float<1.2>
type F3 = Float<1.0>
type F4 = Float<0>
type F5 = Int<-123>
type F6 = Int<-1.2>
type F7 = Int<-1.0>
type F8 = Int<-0>

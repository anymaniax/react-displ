export type As<Props = any> = React.ElementType<Props>;

export type DefaultProps<C extends keyof JSX.IntrinsicElements> = Omit<
  JSX.IntrinsicElements[C],
  'ref' | 'css'
> & {
  as?: As;
};

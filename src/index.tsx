import { Slot } from '@radix-ui/react-slot';
import React, {
  Children,
  createElement,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { createContext } from './create-context';
import { As } from './types';

type DisplayContextProps = Partial<
  Record<
    string,
    {
      min?: number | undefined;
      max?: number | undefined;
    }
  >
>;

const [DisplayContext, useDisplayContext] = createContext<DisplayContextProps>({
  name: 'DisplayContext',
  strict: false,
});

type PublicDisplayComponentProps = React.FC<
  Omit<DisplayComponentProps, 'config' | 'media' | 'defaultTagName'>
>;

export const createDisplay = <T extends string = string>(
  config: Record<T, number>,
  options?: {
    isLazy?: boolean;
    defaultTagName?: string;
    as?: As;
  },
): typeof Display & Record<T, PublicDisplayComponentProps> => {
  const Display = ({ children }: { children: ReactNode }) => {
    const [media, setMedia] = useState<
      Partial<Record<string, { min?: number; max?: number }>>
    >({});

    const childrenArray = React.Children.toArray(children) as ReactElement[];

    useEffect(() => {
      const mediaQueries = childrenArray
        .map((child) => (child.type as any)?.displayName.toLowerCase())
        .filter(Boolean);

      const breakpoints = mediaQueries
        .map((media: T) => [media, config[media]])
        .sort((a, b) => (a[1] > b[1] ? 1 : -1)) as [string, number][];

      if (breakpoints.length === 1) {
        const [media, breakpoint] = breakpoints[0];
        setMedia({
          [media]: {
            max: breakpoint,
          },
        });

        return;
      }

      setMedia(
        breakpoints.reduce((acc, [media, breakpoint], index, arr) => {
          if (!index) {
            return {
              [media]: {
                max: arr[index + 1][1] - 1,
              },
            };
          }

          if (index === arr.length - 1) {
            return {
              ...acc,
              [media]: {
                min: breakpoint,
              },
            };
          }

          return {
            ...acc,
            [media]: {
              max: arr[index + 1][1] - 1,
              min: breakpoint,
            },
          };
        }, {}),
      );
    }, [childrenArray.length]);

    return <DisplayContext value={media}>{children}</DisplayContext>;
  };

  Object.keys(config).forEach((media) => {
    const Media: PublicDisplayComponentProps = (props) => (
      <DisplayComponent
        media={media as T}
        config={config}
        {...options}
        {...props}
      />
    );

    // @ts-ignore
    Display[media] = Media;
    // @ts-ignore
    Display[media].displayName = media;
  });

  return Display as typeof Display & Record<T, PublicDisplayComponentProps>;
};

type DisplayComponentProps<T extends string = string> = {
  media: T;
  as?: As;
  config: Record<T, number>;
  defaultTagName?: string;
  children?: ReactNode;
  isLazy?: boolean;
};

const DisplayComponent = <T extends string = string>({
  media,
  isLazy,
  children,
  defaultTagName = 'div',
  as,
  config,
  ...rest
}: DisplayComponentProps<T>) => {
  const displayContext = useDisplayContext();

  const [mediaQuery, setMediaQuery] = useState(
    calculateMediaQuery({ media, displayContext, config }),
  );
  const [isMatch, setMatch] = useState(false);

  useEffect(() => {
    setMediaQuery(calculateMediaQuery({ media, displayContext, config }));
  }, [displayContext]);

  useEffect(() => {
    const resize = () => {
      setMatch(
        window.innerWidth >= (mediaQuery?.min || 0) &&
          window.innerWidth <= (mediaQuery?.max || Infinity),
      );
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [mediaQuery]);

  if (!mediaQuery || (isLazy && !isMatch)) {
    return null;
  }

  const props = !isMatch
    ? {
        'data-media': media,
        'aria-hidden': true,
        style: {
          display: 'none',
        },
      }
    : { 'data-media': media };

  if (as) {
    return createElement(as, { ...rest, ...props, children });
  }

  if ((children as ReactElement)?.type && Children.only(children)) {
    return (
      <Slot {...rest} {...props}>
        {children}
      </Slot>
    );
  }

  return createElement(defaultTagName, {
    ...rest,
    ...props,
    children,
  });
};

const calculateMediaQuery = <T extends string = string>({
  media,
  displayContext,
  config,
}: {
  media: T;
  config: Record<T, number>;
  displayContext: DisplayContextProps;
}):
  | {
      min?: number | undefined;
      max?: number | undefined;
    }
  | undefined => {
  if (displayContext) {
    return displayContext[media];
  }

  if (typeof config[media] === 'undefined') {
    return;
  }

  const configEntries: [string, number][] = Object.entries(config);

  const mediaIndex = configEntries.findIndex(([key]) => key === media);

  return {
    min: configEntries[mediaIndex][1],
    max: configEntries[mediaIndex + 1]?.[1],
  };
};

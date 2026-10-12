import {useMemo} from 'react'
import {Canvas, FillType, Group, Path, Skia} from '@shopify/react-native-skia'
import {ICON_SIZES, type ColorToken, type IconSize} from '@duro-app/tokens/keys'
import {useResolvedColors, type IconName} from '@duro-app/ui'
import {GLYPHS} from '../../../../packages/ui/src/components/Icon/geometry'
import {pathData} from './pathData'

/** The benchmark's Skia candidate: Duro's geometry on one Canvas per icon. */
export function SkiaIcon({
  name,
  size = 'lg',
  color = 'text',
}: {
  name: IconName
  size?: IconSize
  color?: ColorToken
}) {
  const px = ICON_SIZES[size]
  const resolved = useResolvedColors()[color]
  const glyph = GLYPHS[name]
  const paths = useMemo(
    () =>
      glyph.shapes.map((shape) => {
        const path = Skia.Path.MakeFromSVGString(pathData(shape))!
        if (shape.tag === 'path' && shape.fillRule === 'evenodd') path.setFillType(FillType.EvenOdd)
        const fill =
          shape.tag === 'path' && shape.fill
            ? shape.fill === 'currentColor'
            : glyph.style === 'fill'
        const stroke =
          shape.tag === 'path' && shape.stroke
            ? shape.stroke === 'currentColor'
            : glyph.style === 'stroke'
        return {path, fill, stroke}
      }),
    [glyph],
  )
  return (
    <Canvas style={{width: px, height: px}}>
      <Group transform={[{scale: px / 24}]}>
        {paths.map(({path, fill, stroke}, i) => (
          <Group key={i}>
            {fill ? <Path path={path} color={resolved} style="fill" /> : null}
            {stroke ? (
              <Path
                path={path}
                color={resolved}
                style="stroke"
                strokeWidth={2}
                strokeCap="round"
                strokeJoin="round"
              />
            ) : null}
          </Group>
        ))}
      </Group>
    </Canvas>
  )
}

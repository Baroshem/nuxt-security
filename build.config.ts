import { defineBuildConfig } from "unbuild"
export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/utils/hash.ts',
    'src/utils/headers.ts',
    'src/utils/merge.ts'

  ]
})
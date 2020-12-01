import { createTypeOperatorNode } from "typescript"

interface CompressorOption {
  fileName: string,
  extention: string,
  quality: number | null
}

export { CompressorOption }
import {
  BsFileEarmarkWordFill,
  BsFileEarmarkExcelFill,
  BsFileEarmarkPptFill,
  BsFileEarmarkPdfFill,
  BsFileEarmarkPlayFill,
  BsFileEarmarkMusicFill,
  BsFileEarmarkFontFill,
  BsFileEarmarkImageFill,
  BsFileEarmarkMinusFill,
  BsApple,
  BsWindows,
  BsFileEarmarkZipFill,
  BsMarkdownFill,
  BsFiletypeYml,
  BsFiletypeXml,
} from "solid-icons/bs"
import {
  SiAdobephotoshop,
  SiAdobepremierepro,
  SiAdobeillustrator,
  SiAdobeaftereffects,
  SiAdobeaudition,
  SiAdobeindesign,
  SiTypescript,
  SiGnubash,
  SiJavascript,
  SiPhp,
} from "solid-icons/si"
import {
  FaSolidDatabase,
  FaSolidBook,
  FaSolidCompactDisc,
} from "solid-icons/fa"
import { IoFolder } from "solid-icons/io"
import { ImAndroid } from "solid-icons/im"
import { Obj, ObjType } from "~/types"
import { ext } from "./path"
import { FaBrandsGolang, FaBrandsJava, FaBrandsPython } from "solid-icons/fa"
import {
  BiSolidFileJson,
  BiSolidFileCss,
  BiSolidFileHtml,
} from "solid-icons/bi"

//下面是我使用的图标示例，也要添加上面对应的库导入进来喔
const iconMap = {
  "dmg,ipa,plist,tipa": BsApple,
  "exe,msi": BsWindows,
  "zip,gz,rar,7z,tar,jar,xz": BsFileEarmarkZipFill,
  apk: ImAndroid,
  "db,db-shm,db-wal,sql": FaSolidDatabase,
  md: BsMarkdownFill,
  epub: FaSolidBook,
  iso: FaSolidCompactDisc,
  m3u8: BsFileEarmarkPlayFill,
  "doc,docx": BsFileEarmarkWordFill,
  "xls,xlsx,csv": BsFileEarmarkExcelFill,
  "ppt,pptx": BsFileEarmarkPptFill,
  pdf: BsFileEarmarkPdfFill,
  // Adobe
  "psd,pdd": SiAdobephotoshop,
  prproj: SiAdobepremierepro,
  "ai,ait,eps,epsf,ps": SiAdobeillustrator,
  aep: SiAdobeaftereffects,
  sesx: SiAdobeaudition,
  indd: SiAdobeindesign,
  // code
  go: FaBrandsGolang,
  java: FaBrandsJava,
  pnp: SiPhp,
  "py,pyc,pyo,pyi,pyw,pyd,pyx": FaBrandsPython,
  "ts,tsx": SiTypescript,
  "yaml,yml,toml": BsFiletypeYml,
  xml: BsFiletypeXml,
  sh: SiGnubash,
  json: BiSolidFileJson,
  "js,mjs,cjs": SiJavascript,
  css: BiSolidFileCss,
  html: BiSolidFileHtml,
}

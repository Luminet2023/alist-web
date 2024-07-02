import { Button, HStack } from "@hope-ui/solid"
import { createSignal } from "solid-js"
// import { useT } from "~/hooks"
import { ObjStore, objStore } from "~/store"
import { api, baseName, safeBtoa } from "~/utils"
import { FileInfo } from "./info"
import { useCopyLink, useLink, useT } from "~/hooks"

const Ipa = () => {
  const t = useT()
  const [installing, setInstalling] = createSignal(false)
  const [trInstalling, setTrInstalling] = createSignal(false)
  const { copyCurrentRawLink } = useCopyLink()
  const { currentObjLink } = useLink()
  return (
    <FileInfo>
      <HStack spacing="$2">
        {/* 原生IPA安装 */}
        <Button
          as="a"
          href={
            "itms-services://?action=download-manifest&url=" +
            `${api}/i/${safeBtoa(
              encodeURIComponent(objStore.raw_url) +
                "/" +
                baseName(encodeURIComponent(objStore.obj.name)),
            )}.plist`
          }
          onClick={() => {
            setInstalling(true)
          }}
        >
          {t(`home.preview.${installing() ? "installing" : "install"}`)}
        </Button>
        {/* 巨魔测试 | use install TrollStore IPA*/}
        <Button
          as="a"
          colorScheme="primary"
          href={
            "apple-magnifier://install?url=" +
            encodeURIComponent(currentObjLink(true))
          }
          onClick={() => {
            setTrInstalling(true)
          }}
        >
          {t(`home.preview.${trInstalling() ? "tr-installing" : "tr-install"}`)}
        </Button>

        {/* 从这里到
        下载按钮文件拷贝的位置
          alist-web\src\pages\home\previews\download.tsx
         primary  青绿色
         accent   紫色
         neutral  灰色
         success  绿色
         info     无？
         warning  橙色
         danger   红色
         */}
        <Button
          colorScheme="danger"
          as="a"
          href={objStore.raw_url}
          target="_blank"
        >
          {t("home.preview.download")}
        </Button>
        <Button colorScheme="accent" onClick={() => copyCurrentRawLink(true)}>
          {t("home.toolbar.copy_link")}
        </Button>
      </HStack>
      {/* 到这里 还有开头的 <HStack spacing="$2"> 都是自己加的 */}
    </FileInfo>
  )
}

export default Ipa

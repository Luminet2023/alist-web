import {
  Button,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Checkbox,
} from "@hope-ui/solid"
import { createSignal } from "solid-js"
import { MaybeLoading } from "~/components"
import { useFetch, useManageTitle, useT, useUtil } from "~/hooks"
import { Group, SettingItem, PResp, Geetest } from "~/types"
import { handleResp, notify, r } from "~/utils"
import { Item } from "./SettingItem"
import { createStore } from "solid-js/store"
import { setuid } from "process"
import axios from "axios"

const OtherSettings = () => {
  const t = useT()
  useManageTitle("manage.sidemenu.other")
  const [uri, setUri] = createSignal("")
  const [user, setUser] = createSignal("")
  const [secret, setSecret] = createSignal("")
  const [GeetestEnabled, setGeetestEnabled] = createSignal("")
  const [qbitUrl, setQbitUrl] = createSignal("")
  const [qbitSeedTime, setQbitSeedTime] = createSignal("")
  const [token, setToken] = createSignal("")
  const [settings, setSettings] = createSignal<SettingItem[]>([])
  const [settingsLoading, settingsData] = useFetch(
    (): PResp<SettingItem[]> =>
      r.get(`/admin/setting/list?groups=${Group.GEETEST},${Group.SINGLE}`),
  )
  const [setAria2Loading, setAria2] = useFetch(
    (): PResp<string> =>
      r.post("/admin/user/del_cache", {
        Uri: uri(),
      }),
  )
  const [setDelUserName, DEL_TOKEN] = useFetch(
    (): PResp<string> => r.post("/admin/user/del_cache?username=" + user(), {}),
  )
  const refresh = async () => {
    const resp = await settingsData()
    handleResp(resp, (data) => {
      setUri(data.find((i) => i.key === "geetest_id")?.value || "")
      setSecret(data.find((i) => i.key === "geetest_key")?.value || "")
      setGeetestEnabled(
        data.find((i) => i.key === "geetest_enabled")?.value || "",
      )
      setQbitUrl(data.find((i) => i.key === "qbittorrent_url")?.value || "")
      setQbitSeedTime(
        data.find((i) => i.key === "qbittorrent_seedtime")?.value || "",
      )
      setSettings(data)
    })
  }
  refresh()
  const [resetTokenLoading, resetToken] = useFetch(
    (): PResp<string> => r.post("/admin/setting/reset_token"),
  )
  const { copy } = useUtil()
  const [gt, setGeetest] = useFetch(
    (): PResp<string> =>
      r.post("/admin/setting/set_geetest", { Uri: uri(), Secret: secret() }),
  )
  return (
    <MaybeLoading loading={settingsLoading()}>
      <Heading mb="$2">{t("验证码")}</Heading>
      <Item
        {...settings().find((i) => i.key === "geetest_enabled")!}
        value={GeetestEnabled()}
        onChange={(str) => setGeetestEnabled(str)}
      />
      <SimpleGrid gap="$2" columns={{ "@initial": 1, "@md": 2 }}>
        <Item
          {...settings().find((i) => i.key === "geetest_id")!}
          value={uri()}
          onChange={(str) => setUri(str)}
        />
        <Item
          {...settings().find((i) => i.key === "geetest_key")!}
          value={secret()}
          onChange={(str) => setSecret(str)}
        />
      </SimpleGrid>
      <Button
        my="$2"
        loading={setAria2Loading()}
        onClick={async () => {
          const resp = await setAria2()
          handleResp(resp, (data) => {
            notify.success(`${t("success")}`)
          })
        }}
      >
        {t("settings_other.set_aria2")}
      </Button>
      <Item
        {...settings().find((i) => i.help === "")!}
        value={""}
        onChange={(str) => setUser(str)}
      />
      <Button
        my="$2"
        loading={setDelUserName()}
        onClick={async () => {
          const resp = await DEL_TOKEN()
          handleResp(resp, (data) => {
            notify.success(`${t("success")}`)
          })
        }}
      >
        {t("清除登录态")}
      </Button>
    </MaybeLoading>
  )
}

export default OtherSettings

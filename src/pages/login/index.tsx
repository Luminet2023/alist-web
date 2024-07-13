import {
  Image,
  Center,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  useColorModeValue,
  HStack,
  VStack,
  Checkbox,
  Icon,
} from "@hope-ui/solid"
import { createMemo, createSignal, Show } from "solid-js"
import { SwitchColorMode, SwitchLanguageWhite } from "~/components"
import { useFetch, useT, useTitle, useRouter } from "~/hooks"
import {
  changeToken,
  r,
  notify,
  handleRespWithoutNotify,
  base_path,
  handleResp,
  hashPwd,
} from "~/utils"
import axios from "axios"
import { api, log } from "~/utils"
import { getMainColor } from "~/store"
import { PResp, Resp } from "~/types"
import LoginBg from "./LoginBg"
import { createStorageSignal } from "@solid-primitives/storage"
import { getSetting, getSettingBool } from "~/store"
import { SSOLogin } from "./SSOLogin"
import { IoFingerPrint } from "solid-icons/io"
import {
  parseRequestOptionsFromJSON,
  get,
  AuthenticationPublicKeyCredential,
  supported,
  CredentialRequestOptionsJSON,
} from "@github/webauthn-json/browser-ponyfill"
import "./gt4.js"
import "./ui.css"
declare const initGeetest4: any
const Login = () => {
  const logos = getSetting("logo").split("\n")
  const logo = useColorModeValue(logos[0], logos.pop())
  const t = useT()
  const title = createMemo(() => {
    return `${getSetting("site_title")}`
  })
  useTitle(title)
  const bgColor = useColorModeValue("white", "$neutral1")
  const [username, setUsername] = createSignal(
    localStorage.getItem("username") || "",
  )
  const [lot_number, setlot_number] = createSignal(
    localStorage.getItem("lot_number") || "",
  )
  const [captcha_output, setcaptcha_output] = createSignal(
    localStorage.getItem("captcha_output") || "",
  )
  const [pass_token, setpass_token] = createSignal(
    localStorage.getItem("pass_token") || "",
  )
  const [gen_time, setgen_time] = createSignal(
    localStorage.getItem("gen_time") || "",
  )
  const [sign_token, setsign_token] = createSignal(
    localStorage.getItem("sign_token") || "",
  )
  const [password, setPassword] = createSignal(
    localStorage.getItem("password") || "",
  )
  const [opt, setOpt] = createSignal("")
  const [useauthn, setuseauthn] = createSignal(false)
  const [remember, setRemember] = createStorageSignal("remember-pwd", "false")
  const [useLdap, setUseLdap] = createSignal(false)
  const [loading, data] = useFetch(
    async (): Promise<Resp<{ token: string }>> => {
      const storedCaptcha = localStorage.getItem("captcha")
      const result = storedCaptcha ? JSON.parse(storedCaptcha) : null
      if (useLdap()) {
        return r.post("/auth/login/ldap", {
          username: username(),
          password: password(),
          otp_code: opt(),
          // geetest_seccode:result.geetest_seccode,
          // geetest_validate:result.geetest_validate,
          // geetest_challenge:result.geetest_challenge,
          // lot_number: result.lot_number,
        })
      } else {
        return r.post("/auth/login/hash", {
          username: username(),
          password: hashPwd(password()),
          otp_code: opt(),
          // geetest_seccode:result.geetest_seccode,
          // geetest_validate:result.geetest_validate,
          // geetest_challenge:result.geetest_challenge,
          lot_number: lot_number(),
          captcha_output: captcha_output(),
          pass_token: pass_token(),
          gen_time: gen_time(),
          sign_token: sign_token(),
        })
      }
    },
  )
  const [, postauthnlogin] = useFetch(
    (
      session: string,
      credentials: AuthenticationPublicKeyCredential,
      username: string,
    ): Promise<Resp<{ token: string }>> =>
      r.post(
        "/authn/webauthn_finish_login?username=" + username,
        JSON.stringify(credentials),
        {
          headers: {
            session: session,
          },
        },
      ),
  )
  interface Webauthntemp {
    session: string
    options: CredentialRequestOptionsJSON
  }
  const [, getauthntemp] = useFetch(
    (username): PResp<Webauthntemp> =>
      r.get("/authn/webauthn_begin_login?username=" + username),
  )
  const { searchParams, to } = useRouter()
  const AuthnSignEnabled = getSettingBool("webauthn_login_enabled")
  const AuthnSwitch = async () => {
    setuseauthn(!useauthn())
  }
  const Login = async () => {
    if (!useauthn()) {
      if (remember() === "true") {
        localStorage.setItem("username", username())
        localStorage.setItem("password", password())
      } else {
        localStorage.removeItem("username")
        localStorage.removeItem("password")
      }
      const resp = await data()
      handleRespWithoutNotify(
        resp,
        (data) => {
          notify.success(t("login.success"))
          changeToken(data.token)
          to(
            decodeURIComponent(searchParams.redirect || base_path || "/"),
            true,
          )
        },
        (msg, code) => {
          if (!needOpt() && code === 402) {
            setNeedOpt(true)
          } else {
            notify.error(msg)
          }
        },
      )
    } else {
      if (!supported()) {
        notify.error(t("users.webauthn_not_supported"))
        return
      }
      changeToken()
      if (remember() === "true") {
        localStorage.setItem("username", username())
      } else {
        localStorage.removeItem("username")
      }
      const resp = await getauthntemp(username())
      handleResp(resp, async (data) => {
        try {
          const options = parseRequestOptionsFromJSON(data.options)
          const credentials = await get(options)
          const resp = await postauthnlogin(
            data.session,
            credentials,
            username(),
          )
          handleRespWithoutNotify(resp, (data) => {
            notify.success(t("login.success"))
            changeToken(data.token)
            to(
              decodeURIComponent(searchParams.redirect || base_path || "/"),
              true,
            )
          })
        } catch (error: unknown) {
          if (error instanceof Error) notify.error(error.message)
        }
      })
    }
  }
  const [needOpt, setNeedOpt] = createSignal(false)
  const ldapLoginEnabled = getSettingBool("ldap_login_enabled")
  const ldapLoginTips = getSetting("ldap_login_tips")
  if (ldapLoginEnabled) {
    setUseLdap(true)
  }
  let load: boolean = false
  // const captcha = () => {
  //   initGeetest4(
  //     {
  //       captchaId: "ddd701191607e83c9d8d87020099d5aa",
  //       product: "popup",
  //     },
  //     function (captcha: any) {
  //       // captcha 为验证码实例
  //       captcha.appendTo("#captcha")
  //       captcha
  //         .onReady(function () {})
  //         .onSuccess(function () {
  //           let result = captcha.getValidate()
  //           console.log(result)
  //           localStorage.setItem("captcha", JSON.stringify(result))
  //           Login()
  //         })
  //         .onError(function () {
  //           notify.error("肥鸡验证失败")
  //         })
  //     },
  //   )
  // }

  interface GeetestData {
    need_captcha: boolean
    captchaId: string
    new_captcha: boolean
    gt: string
    challenge: string
    success: boolean
  }

  interface GeetestConfig {
    need_captcha: boolean
  }

  async function fetchData(url: string): Promise<GeetestData> {
    try {
      const response = await axios.get(url)
      return response.data as GeetestData
    } catch (error: any) {
      notify.error(error)
      throw error
    }
  }
  const captcha = () => {
    const apiUrl = api + "/api/auth/need_captcha"
    fetchData(apiUrl)
      .then((data: GeetestData) => {
        const geetestConfig: GeetestConfig = {
          need_captcha: data.need_captcha,
        }
        if (data.need_captcha === true) {
          initGeetest4(
            {
              captchaId: data.captchaId,
              product: "bind",
            },
            function (captcha: any) {
              // captcha 为验证码实例
              captcha.appendTo("#captcha")
              captcha
                .onReady(function () {
                  captcha.showCaptcha()
                })
                .onSuccess(function () {
                  let result = captcha.getValidate()
                  setlot_number(result.lot_number)
                  setcaptcha_output(result.captcha_output)
                  setpass_token(result.pass_token)
                  setgen_time(result.gen_time)
                  setsign_token(result.sign_token)
                  Login()
                })
                .onError(function () {
                  notify.error("肥鸡验证失败")
                })
            },
          )
        } else {
          Login()
        }
        // 初始化 Geetest
      })

      .catch((error) => {
        notify.error("肥鸡验证失败")
      })
  }
  // const captcha = () => {
  //   const apiUrl = api + "/api/auth/create_challenge"
  //   fetchData(apiUrl)
  //     .then((data: GeetestData) => {
  //       const geetestConfig: GeetestConfig = {
  //         gt: data.gt,
  //         challenge: data.challenge,
  //         offline: !data.success,
  //         new_captcha: data.new_captcha,
  //       }

  //       // 初始化 Geetest
  //       initGeetest(
  //         geetestConfig,
  //         (captcha: {
  //           appendTo: (arg0: string) => void
  //           onReady: (arg0: () => void) => {
  //             (): any
  //             new (): any
  //             onSuccess: {
  //               (arg0: () => void): {
  //                 (): any
  //                 new (): any
  //                 onError: { (arg0: () => void): void; new (): any }
  //               }
  //               new (): any
  //             }
  //           }
  //           getValidate: () => any
  //         }) => {
  //           captcha.appendTo("#captcha")
  //           captcha
  //             .onReady(function () {captcha})
  //             .onSuccess(function () {
  //               let result = captcha.getValidate()
  //               console.log(result)
  //               localStorage.setItem("captcha", JSON.stringify(result))
  //               Login()
  //             })
  //             .onError(function () {
  //               notify.error("肥鸡验证失败")
  //             })
  //         },
  //       )
  //     })
  //     .catch((error) => {
  //       notify.error("肥鸡验证失败")
  //     })
  // }

  return (
    <Center zIndex="1" w="$full" h="100vh">
      <VStack
        bgColor={bgColor()}
        rounded="$xl"
        p="24px"
        w={{
          "@initial": "90%",
          "@sm": "364px",
        }}
        spacing="$4"
      >
        <Flex alignItems="center" justifyContent="space-around">
          <Image mr="$2" boxSize="$12" src={logo()} />
          <Heading color="$info9" fontSize="$2xl">
            {title()}
          </Heading>
        </Flex>
        <Show
          when={!needOpt()}
          fallback={
            <Input
              id="totp"
              name="otp"
              placeholder={t("login.otp-tips")}
              value={opt()}
              onInput={(e) => setOpt(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  captcha()
                }
              }}
            />
          }
        >
          <Input
            name="username"
            placeholder={t("login.username-tips")}
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
          />
          <Show when={!useauthn()}>
            <Input
              name="password"
              placeholder={t("login.password-tips")}
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  captcha()
                }
              }}
            />
          </Show>
          <Flex
            px="$1"
            w="$full"
            fontSize="$sm"
            color="$neutral10"
            justifyContent="space-between"
            alignItems="center"
          >
            <Checkbox
              checked={remember() === "true"}
              onChange={() =>
                setRemember(remember() === "true" ? "false" : "true")
              }
            >
              {t("login.remember")}
            </Checkbox>
            <Text as="a" target="_blank" href={t("login.forget_url")}>
              {t("login.forget")}
            </Text>
          </Flex>
        </Show>
        <HStack w="$full" spacing="$2">
          <Show when={!useauthn()}>
            <Button
              colorScheme="primary"
              w="$full"
              onClick={() => {
                if (needOpt()) {
                  setOpt("")
                } else {
                  setUsername("")
                  setPassword("")
                }
              }}
            >
              {t("login.clear")}
            </Button>
          </Show>
          <Button
            w="$full"
            loading={loading()}
            class="g-recaptcha"
            data-sitekey="reCAPTCHA_site_key"
            data-callback="onSubmit"
            data-action="submit"
            onclick={captcha}
          >
            {t("login.login")}
          </Button>
        </HStack>
        <Show when={ldapLoginEnabled}>
          <Checkbox
            w="$full"
            checked={useLdap() === true}
            onChange={() => setUseLdap(!useLdap())}
          >
            {ldapLoginTips}
          </Checkbox>
        </Show>
        <Button
          w="$full"
          colorScheme="accent"
          onClick={() => {
            changeToken()
            to(
              decodeURIComponent(searchParams.redirect || base_path || "/"),
              true,
            )
          }}
        >
          {t("login.use_guest")}
        </Button>
        <div id="captcha"></div>
        <Flex
          mt="$2"
          justifyContent="space-evenly"
          alignItems="center"
          color="$neutral10"
          w="$full"
        >
          <SwitchLanguageWhite />
          <SwitchColorMode />
          <SSOLogin />
          <Show when={AuthnSignEnabled}>
            <Icon
              cursor="pointer"
              boxSize="$8"
              color={getMainColor()}
              as={IoFingerPrint}
              p="$0_5"
              onclick={AuthnSwitch}
            />
          </Show>
        </Flex>
      </VStack>
      <LoginBg />
    </Center>
  )
}

export default Login

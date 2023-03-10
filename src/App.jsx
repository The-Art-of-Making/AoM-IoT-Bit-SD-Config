import { useState } from "react"
import { resolveResource, resourceDir } from "@tauri-apps/api/path"
import { readSecretsFile, writeSecretsFile } from "./file_handler"
import { platform } from "@tauri-apps/api/os"
import Table from "./Table"
import Input from "./Input"
import Secret from "./secret"

const secretsFile = "secrets.txt"
const defaultSecretValues = ["2", "G34", "designthinking", "aom_cloud", "cloud", "", "aio_NJfv16SrWTD9ftxtNEAQwdnB47a9"]
const ioPlusFeedKeyPrefix = "feed-"
const feedLetters = ["a", "b", "c", "d", "e", "f"]

function App() {
  const [REQUEST_RATE_SEC, set_REQUEST_RATE_SEC] = useState("")
  const [SECRET_SSID, set_SECRET_SSID] = useState("")
  const [SECRET_PASS, set_SECRET_PASS] = useState("")
  const [IO_USERNAME, set_IO_USERNAME] = useState("")
  const [IO_GROUP, set_IO_GROUP] = useState("")
  const [IO_FEED_KEY, set_IO_FEED_KEY] = useState("")
  const [IO_PLUS_FEED_KEY, set_IO_PLUS_FEED_KEY] = useState("")
  const [IO_KEY, set_IO_KEY] = useState("")

  const setFields = {
    0: set_REQUEST_RATE_SEC,
    1: set_SECRET_SSID,
    2: set_SECRET_PASS,
    3: set_IO_USERNAME,
    4: set_IO_GROUP,
    5: set_IO_FEED_KEY,
    6: set_IO_KEY
  }

  function getIOFeedKey() {
    let ioFeedKey = IO_FEED_KEY
    const feedLetterIndex = feedLetters.indexOf(IO_PLUS_FEED_KEY)
    if (feedLetterIndex > -1)
    {
      let key = ioPlusFeedKeyPrefix + feedLetters[feedLetterIndex]
      set_IO_FEED_KEY(key)
      ioFeedKey = key
    }
    return ioFeedKey
  }

  async function getPWDMacOS() {
    const resourceDirPath = await resourceDir()
    const resourceDirPathSplit = resourceDirPath.split("/")
    return resourceDirPathSplit.slice(0, resourceDirPathSplit.length-4).join("/") + "/"
  }

  async function getSecretsFilePath() {
    const platformName = await platform()
    let pwd = ""
    let secretsFilePath = ""
    if (platformName == "darwin") {
      pwd = await getPWDMacOS()
      console.log(pwd)
      secretsFilePath = pwd + secretsFile
    }
    else {
      secretsFilePath = await resolveResource(secretsFile)
    }
    return secretsFilePath
  }

  async function readFile() {
    const secretsFilePath = await getSecretsFilePath()
    let secrets = await readSecretsFile(secretsFilePath, defaultSecretValues)
    secrets.log()
    for (let i = 0; i < secrets.fields_length; i++)
    {
      setFields[i](secrets.getField(i))

      if (i === 5)
      {
        set_IO_PLUS_FEED_KEY("")
        for (let j = 0; j < feedLetters.length; j++)
        {
          if (secrets.getField(i) === ioPlusFeedKeyPrefix + feedLetters[j]) {
            set_IO_PLUS_FEED_KEY(feedLetters[j])
          }
        }
      }

      if (i === 5)
      {
        set_IO_PLUS_FEED_KEY("")
        for (let j = 0; j < feedLetters.length; j++)
        {
          if (secrets.getField(i) === ioPlusFeedKeyPrefix + feedLetters[j]) {
            set_IO_PLUS_FEED_KEY(feedLetters[j])
          }
        }
      }
    }
  }

  async function writeFile() {
    const secretsFilePath = await getSecretsFilePath()
    let secret = new Secret(defaultSecretValues)
    const currentFields = [REQUEST_RATE_SEC, SECRET_SSID, SECRET_PASS, IO_USERNAME, IO_GROUP, getIOFeedKey(), IO_KEY]
    for (let i = 0; i < currentFields.length; i++)
    {
      secret.setField(i, currentFields[i])
    }
    await writeSecretsFile(secretsFilePath, secret)
  }

  async function reset() {
    const secretsFilePath = await getSecretsFilePath()
    let secret = new Secret(defaultSecretValues)
    await writeSecretsFile(secretsFilePath, secret)
    await readFile()
  }

  return (
    <div className="container pb-5">
      <h1>AoM IoT Bit Config</h1>

      <div className="row" style={{textAlign: "center"}}>
        <div>
          <button className="btn btn-primary m-1" onClick={() => readFile()}>
            Load Existing Data
          </button>
          <button className="btn btn-success m-1" onClick={() => writeFile()}>
            Save
          </button>
          <button className="btn btn-danger m-1" onClick={() => reset()}>
            Reset
          </button>
        </div>
      </div>

      <Table title="Adafruit IO" hide={true} body={
        <>
          <Input
            label="AoM Cloud Feed"
            description="The feed the bit will GET data from or POST data to - feed X"
            currentInput={IO_PLUS_FEED_KEY}
            setInput={set_IO_PLUS_FEED_KEY}
          />
          <Input
            label="Request Rate (seconds)"
            description="Determines how often the IoT bit will try to download data, e.g. the bit will request feed data every 2 seconds with a value of 2"
            currentInput={REQUEST_RATE_SEC}
            setInput={set_REQUEST_RATE_SEC}
          />
        </>
      } />

      <Table title="Advanced Adafruit IO" hide={true} body={<>
          <Input
            label="Adafruit IO Username"
            description="The Adafruit IO username of the AoM Cloud - aom_cloud"
            currentInput={IO_USERNAME}
            setInput={set_IO_USERNAME}
          />
          <Input
            label="Adafruit IO Group"
            description="Name of the group with the feed the bit should access - cloud"
            currentInput={IO_GROUP}
            setInput={set_IO_GROUP}
          />
          <Input
            label="Adafruit IO Feed Key"
            description="Key for the feed the bit will GET data from or POST data to - feed X"
            currentInput={IO_FEED_KEY}
            setInput={set_IO_FEED_KEY}
          />
          <Input
            label="Adafruit IO Key"
            description="Key used to connect to Adafruit IO services, usually is 32 characters and begins with 'aio_'"
            currentInput={IO_KEY}
            setInput={set_IO_KEY}
          />
        </>
      } />

      <Table title="Wifi" hide={true} body={
        <>
          <Input
            label="Wifi SSID"
            description="(Case-sensitive!) Name of the Wifi network the bit will connect to. The SSID of G34 WiFi is G34. If you are using a phone as a mobile hotspot, it will be the name of your phone."
            currentInput={SECRET_SSID}
            setInput={set_SECRET_SSID}
          />
          <Input
            label="Wifi Password"
            description="(Case-sensitive!) Password of the Wifi network the bit will connect to. The Password of G34 WiFi is designthinking. Keep the SSID and password a secret!"
            currentInput={SECRET_PASS}
            setInput={set_SECRET_PASS}
          />
        </>
      } />

    </div>
  )
}

export default App

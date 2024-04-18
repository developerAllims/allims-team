const fs = require('fs')
const axios = require('axios')
const { execSync } = require('child_process')

const ipFilename = 'ips.txt'

const getGitUser = () => {
  const cmd = 'git config user.name'
  const out = execSync(cmd).toString().trim()
  return out
}

const dtoGitUserToAcronym = (username = '') => {
  const users = {
    joaodejulio: 'JJ',
    lucaschaves: 'LC',
    MarcioAjunior: 'ML',
    Rayago: 'TG',
    'ricardomiranda-allims': 'RM',
    viniciusamirat: 'VA',
    developerAllims: 'RM'
  }
  const out = users[username] || 'XX'
  return out
}

const getUserAcronym = () => {
  const user = getGitUser()
  const acronym = dtoGitUserToAcronym(user)
  return acronym
}

//console.log(getUserAcronym())

const getExternalIp = async () => {
  const url = 'https://api.ipify.org'
  const resp = (await axios.get(url)) || {}
  const { status, data } = resp
  const out = status === 200 ? data : '127.0.0.1'
  return out
}

//;(async () => console.log(await getExternalIp()))()

const getIpFile = () => {
  const buffer = fs.readFileSync(ipFilename)
  const content = Buffer.from(buffer).toString()
  return content
}

const getIpFileLineByUser = (lines, user) => {
  const lineNumber = lines.findIndex((line = '') => {
    const parts = line.split(' #') || []
    return parts[1] === user
  })
  return lineNumber
}

const getNewIpFile = async () => {
  const file = getIpFile()
  const user = getUserAcronym()
  const separator = '\r\n'
  const lines = file.split(separator) || []
  const lineNumber = getIpFileLineByUser(lines, user)
  if (lineNumber >= 0) {
    const newIp = await getExternalIp()
    const newLine = `${newIp} #${user}`
    lines[lineNumber] = newLine
    const newFile = lines.join(separator)
    return newFile
  }
  return file
}

const doGitAdd = () => {
  const cmd = 'git add .'
  const out = execSync(cmd).toString().trim()
  return out
}

const doGitCommit = () => {
  const user = getUserAcronym()
  const cmd = `git commit -m "${user}"`
  const out = execSync(cmd).toString().trim()
  return out
}

const doGitPush = () => {
  const cmd = 'git push'
  const out = execSync(cmd).toString().trim()
  return out
}

const refreshIps = async () => {
  const endpoint = '/api/team'
  const domains = ['allims.net', 'fitossanitario.net']
  for (const domain of domains) {
    await axios.get(`https://${domain}${endpoint}`)
  }
}

;(async () => {
  const newFile = await getNewIpFile()
  fs.writeFileSync(ipFilename, newFile)
  doGitAdd()
  doGitCommit()
  doGitPush()
  await refreshIps()
})()

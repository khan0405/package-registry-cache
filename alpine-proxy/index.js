const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()

const dataDir = path.join(__dirname, 'data')
const repositoryUrl = process.env.REPOSITORY_URL || 'https://dl-cdn.alpinelinux.org'

console.log('origin apk repository url -', repositoryUrl)
console.log('data directory -', dataDir)

const downloadFile = (requestPath, response) => {
  const url = `${repositoryUrl}${requestPath}`
  const request = url.startsWith('https') ? https : http
  return new Promise((resolve) => {
    request
      .get(url, (httpRes) => {
        const filename = path.join(dataDir, requestPath)
        const dir = path.dirname(filename)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        const fileStream = fs.createWriteStream(filename)

        httpRes.pipe(fileStream)
        fileStream.on('finish', () => {
          fileStream.close()
          console.log('downloaded', filename)
          response.sendFile(filename)
          resolve()
        })
        fileStream.on('error', (err) => {
          fs.unlink(filename, () => {
            console.error(err)
            response.status(500).send('Sorry, we cannot find that!')
            resolve()
          })
        })
      })
      .on('error', (err) => {
        fs.unlink(filename, () => {
          console.error(err)
          response.status(404).send('Sorry, we cannot find that!')
          resolve()
        })
      })
  })
}

app.get('/*', (req, res) => {
  const filePath = path.join(dataDir, req.path)
  // 없으면 다운로드
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('error', err)
        res.status(500).send('Sorry, we cannot find that!')
      }
    })
    return
  } //

  downloadFile(req.path, res)
})

const port = process.env.PORT || 3030

app.listen(port, () => {
  console.log('server started in ', port)
})

app.on('error', console.error)

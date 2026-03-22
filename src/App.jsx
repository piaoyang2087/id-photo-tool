import { useState, useRef, useEffect } from 'react'
import './App.css'

const PHOTO_SIZES = {
  '1inch': { width: 295, height: 413, label: '1 寸', desc: '25mm×35mm' },
  '2inch': { width: 413, height: 579, label: '2 寸', desc: '35mm×49mm' },
}

const BG_COLORS = {
  red: { name: '红色', value: '#d90429' },
  white: { name: '白色', value: '#ffffff' },
  blue: { name: '蓝色', value: '#438ddb' },
  custom: { name: '自定义', value: '#ffffff' },
}

// 简单的背景移除算法 - 检测并移除接近白色的背景
const removeSimpleBackground = (img) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // 检测四个角的颜色作为背景色参考
    const corners = [
      [0, 0],
      [canvas.width - 1, 0],
      [0, canvas.height - 1],
      [canvas.width - 1, canvas.height - 1]
    ]
    
    let bgR = 0, bgG = 0, bgB = 0
    corners.forEach(([x, y]) => {
      const idx = (y * canvas.width + x) * 4
      bgR += data[idx]
      bgG += data[idx + 1]
      bgB += data[idx + 2]
    })
    bgR /= 4
    bgG /= 4
    bgB /= 4
    
    console.log('检测到的背景色:', bgR, bgG, bgB)
    
    // 移除接近背景色的像素
    const threshold = 50
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB)
      
      if (diff < threshold) {
        data[i + 3] = 0 // 设置透明
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    const resultImg = new Image()
    resultImg.onload = () => resolve(resultImg)
    resultImg.src = canvas.toDataURL('image/png')
  })
}

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [selectedSize, setSelectedSize] = useState('1inch')
  const [bgColor, setBgColor] = useState('white')
  const [customColor, setCustomColor] = useState('#ffffff')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setIsLoading(true)
      setLoadingText('正在处理图片...')
      
      const reader = new FileReader()
      reader.onload = async (event) => {
        const img = new Image()
        img.onload = async () => {
          try {
            // 尝试简单抠图
            const抠图后 = await removeSimpleBackground(img)
            setOriginalImage(抠图后)
          } catch (err) {
            console.error('处理失败:', err)
            setOriginalImage(img)
          }
          setIsLoading(false)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const size = PHOTO_SIZES[selectedSize]
    const bg = bgColor === 'custom' ? customColor : BG_COLORS[bgColor].value
    
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    
    // 填充背景色
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 计算裁剪区域
    const imgRatio = originalImage.width / originalImage.height
    const targetRatio = size.width / size.height
    
    let sx, sy, sWidth, sHeight
    if (imgRatio > targetRatio) {
      sHeight = originalImage.height
      sWidth = sHeight * targetRatio
      sy = 0
      sx = (originalImage.width - sWidth) / 2
    } else {
      sWidth = originalImage.width
      sHeight = sWidth / targetRatio
      sx = 0
      sy = (originalImage.height - sHeight) / 2
    }
    
    // 绘制人像（带透明通道）
    ctx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height)
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.95))
  }, [originalImage, selectedSize, bgColor, customColor])

  const handleSizeChange = (size) => setSelectedSize(size)
  const handleBgColorChange = (color) => {
    setBgColor(color)
    if (color !== 'custom') setCustomColor(BG_COLORS[color].value)
  }
  const handleExport = () => {
    if (!previewUrl) { alert('请先上传图片'); return }
    const link = document.createElement('a')
    link.download = `证件照_${selectedSize}_${bgColor}_${Date.now()}.jpg`
    link.href = previewUrl
    link.click()
  }
  const handleReset = () => {
    setOriginalImage(null)
    setPreviewUrl(null)
    setSelectedSize('1inch')
    setBgColor('white')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const getCurrentBgColor = () => bgColor === 'custom' ? customColor : BG_COLORS[bgColor].value

  return (
    <div className="app">
      <header className="header">
        <h1>📸 证件照制作工具</h1>
        <p>智能换背景</p>
      </header>
      <main className="main">
        {!originalImage ? (
          <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} style={{ display: 'none' }} />
            {isLoading ? (
              <><div className="upload-icon loading">⏳</div><p className="loading-text">{loadingText}</p><div className="progress-bar"><div className="progress"></div></div></>
            ) : (
              <><div className="upload-icon">📷</div><p>点击上传照片</p><span className="upload-hint">支持 JPG/PNG · 建议纯色背景照片</span></>
            )}
          </div>
        ) : (
          <div className="editor">
            <div className="preview-section">
              <h3>📋 预览效果</h3>
              <div className="preview-container" style={{ backgroundColor: getCurrentBgColor() }}>
                {previewUrl && <img src={previewUrl} alt="预览" className="preview-image" />}
              </div>
              <div className="preview-info">
                <span>{PHOTO_SIZES[selectedSize].label}</span>
                <span>{PHOTO_SIZES[selectedSize].width}×{PHOTO_SIZES[selectedSize].height}px</span>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="section">
              <h3>📐 选择尺寸</h3>
              <div className="size-options">
                {Object.entries(PHOTO_SIZES).map(([key, { label, desc }]) => (
                  <button key={key} type="button" className={`size-btn ${selectedSize === key ? 'active' : ''}`} onClick={() => handleSizeChange(key)}>
                    <strong>{label}</strong><span>{desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="section">
              <h3>🎨 背景颜色</h3>
              <div className="color-options">
                {Object.entries(BG_COLORS).map(([key, { name, value }]) => (
                  <button key={key} type="button" className={`color-btn ${bgColor === key ? 'active' : ''}`} onClick={() => handleBgColorChange(key)} style={{ backgroundColor: key === 'custom' ? customColor : value, border: bgColor === key ? '3px solid #333' : '3px solid transparent' }}>
                    {key === 'custom' ? (<><span style={{ fontSize: '10px', color: '#333' }}>自</span><input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} /></>) : (<span style={{ fontSize: '10px' }}>{name}</span>)}
                  </button>
                ))}
              </div>
              <p className="color-hint">💡 点击颜色按钮立即预览效果</p>
            </div>
            <div className="actions">
              <button type="button" className="btn btn-reset" onClick={handleReset}>🔄 重新上传</button>
              <button type="button" className="btn btn-export" onClick={handleExport}>💾 导出 JPG</button>
            </div>
          </div>
        )}
      </main>
      <footer className="footer"><p>Powered by React + Vite</p></footer>
    </div>
  )
}

export default App

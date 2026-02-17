$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Save-ResizedJpeg {
    param(
        [Parameter(Mandatory = $true)][string]$InputPath,
        [Parameter(Mandatory = $true)][string]$OutputPath,
        [Parameter(Mandatory = $true)][int]$MaxWidth,
        [Parameter(Mandatory = $true)][int]$MaxHeight,
        [int]$Quality = 82
    )

    $inputImage = [System.Drawing.Image]::FromFile($InputPath)
    try {
        $ratioX = $MaxWidth / [double]$inputImage.Width
        $ratioY = $MaxHeight / [double]$inputImage.Height
        $ratio = [Math]::Min([Math]::Min($ratioX, $ratioY), 1.0)

        $newWidth = [Math]::Max([int][Math]::Round($inputImage.Width * $ratio), 1)
        $newHeight = [Math]::Max([int][Math]::Round($inputImage.Height * $ratio), 1)

        $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($inputImage, 0, 0, $newWidth, $newHeight)
            }
            finally {
                $graphics.Dispose()
            }

            $outputDir = Split-Path -Parent $OutputPath
            if (-not [string]::IsNullOrWhiteSpace($outputDir)) {
                New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
            }

            $jpgEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
                Where-Object { $_.MimeType -eq "image/jpeg" } |
                Select-Object -First 1

            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                [System.Drawing.Imaging.Encoder]::Quality,
                [long]$Quality
            )
            $bitmap.Save($OutputPath, $jpgEncoder, $encoderParams)
            $encoderParams.Dispose()
        }
        finally {
            $bitmap.Dispose()
        }
    }
    finally {
        $inputImage.Dispose()
    }
}

$galleryRoot = "public/img/gallery"
$optimizedRoot = "public/img/gallery-optimized"
New-Item -ItemType Directory -Path $optimizedRoot -Force | Out-Null

$images = Get-ChildItem -Path $galleryRoot -File -Recurse | Where-Object {
    $_.Extension.ToLower() -in @(".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif")
}

$expectedOutputs = @{}
$createdOrUpdated = 0

foreach ($file in $images) {
    $relative = $file.FullName.Substring((Resolve-Path $galleryRoot).Path.Length).TrimStart("\")
    $relativeDir = [System.IO.Path]::GetDirectoryName($relative)
    $relativeName = [System.IO.Path]::GetFileNameWithoutExtension($relative)
    $relativeNoExt = if ([string]::IsNullOrWhiteSpace($relativeDir)) {
        $relativeName
    }
    else {
        Join-Path $relativeDir $relativeName
    }
    $thumbOut = Join-Path $optimizedRoot ("thumb/" + $relativeNoExt + ".jpg")
    $fullOut = Join-Path $optimizedRoot ("full/" + $relativeNoExt + ".jpg")

    $normalizedRelative = $relativeNoExt.Replace("\", "/")
    $thumbRel = "thumb/$normalizedRelative.jpg"
    $fullRel = "full/$normalizedRelative.jpg"
    $expectedOutputs[$thumbRel] = $true
    $expectedOutputs[$fullRel] = $true

    $needsThumb = -not (Test-Path $thumbOut) -or ((Get-Item $thumbOut).LastWriteTimeUtc -lt $file.LastWriteTimeUtc)
    $needsFull = -not (Test-Path $fullOut) -or ((Get-Item $fullOut).LastWriteTimeUtc -lt $file.LastWriteTimeUtc)

    if ($needsThumb) {
        Save-ResizedJpeg -InputPath $file.FullName -OutputPath $thumbOut -MaxWidth 640 -MaxHeight 640 -Quality 76
        $createdOrUpdated++
    }
    if ($needsFull) {
        Save-ResizedJpeg -InputPath $file.FullName -OutputPath $fullOut -MaxWidth 1600 -MaxHeight 1600 -Quality 82
        $createdOrUpdated++
    }
}

$deletedStale = 0
if (Test-Path $optimizedRoot) {
    Get-ChildItem -Path $optimizedRoot -Recurse -File -Filter *.jpg | ForEach-Object {
        $rel = $_.FullName.Substring((Resolve-Path $optimizedRoot).Path.Length).TrimStart("\").Replace("\", "/")
        if (-not $expectedOutputs.ContainsKey($rel)) {
            Remove-Item -Path $_.FullName -Force
            $deletedStale++
        }
    }

    Get-ChildItem -Path $optimizedRoot -Recurse -Directory |
        Sort-Object FullName -Descending |
        ForEach-Object {
            if (-not (Get-ChildItem -Path $_.FullName -Force)) {
                Remove-Item -Path $_.FullName -Force
            }
        }
}

$avatarInput = Get-Item "public/img/avatar.png"
$avatar256 = "public/img/avatar-256.jpg"
$avatar512 = "public/img/avatar-512.jpg"

$needsAvatar256 = -not (Test-Path $avatar256) -or ((Get-Item $avatar256).LastWriteTimeUtc -lt $avatarInput.LastWriteTimeUtc)
$needsAvatar512 = -not (Test-Path $avatar512) -or ((Get-Item $avatar512).LastWriteTimeUtc -lt $avatarInput.LastWriteTimeUtc)

if ($needsAvatar256) {
    Save-ResizedJpeg -InputPath $avatarInput.FullName -OutputPath $avatar256 -MaxWidth 256 -MaxHeight 256 -Quality 82
    $createdOrUpdated++
}
if ($needsAvatar512) {
    Save-ResizedJpeg -InputPath $avatarInput.FullName -OutputPath $avatar512 -MaxWidth 512 -MaxHeight 512 -Quality 85
    $createdOrUpdated++
}

Write-Host ("Image optimization complete. updated={0}, removed_stale={1}" -f $createdOrUpdated, $deletedStale)

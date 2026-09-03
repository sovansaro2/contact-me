#!/bin/bash
SRC="public/icon.png"

# Densities and sizes (launcher, foreground)
# mdpi: launcher 48, fg 108 (icon 72)
# hdpi: launcher 72, fg 162 (icon 108)
# xhdpi: launcher 96, fg 216 (icon 144)
# xxhdpi: launcher 144, fg 324 (icon 216)
# xxxhdpi: launcher 192, fg 432 (icon 288)

generate_density() {
    DENSITY=$1
    LAUNCHER_SIZE=$2
    FG_CANVAS=$3
    FG_ICON=$4
    DIR="android/app/src/main/res/mipmap-$DENSITY"
    mkdir -p "$DIR"
    
    # 1. Standard ic_launcher.png
    convert "$SRC" -resize ${LAUNCHER_SIZE}x${LAUNCHER_SIZE} "$DIR/ic_launcher.png"
    
    # 2. Round ic_launcher_round.png
    convert "$SRC" -resize ${LAUNCHER_SIZE}x${LAUNCHER_SIZE} "$DIR/ic_launcher_round.png"
    
    # 3. Adaptive ic_launcher_foreground.png (safe zone centered)
    convert -size ${FG_CANVAS}x${FG_CANVAS} xc:none \
        \( "$SRC" -resize ${FG_ICON}x${FG_ICON} \) \
        -gravity center -composite "$DIR/ic_launcher_foreground.png"
        
    echo "Generated icons for mipmap-$DENSITY"
}

generate_density "mdpi" 48 108 72
generate_density "hdpi" 72 162 108
generate_density "xhdpi" 96 216 144
generate_density "xxhdpi" 144 324 216
generate_density "xxxhdpi" 192 432 288

# Also remove obsolete drawable-v24/ic_launcher_foreground.xml if present
if [ -f "android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml" ]; then
    rm "android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml"
    echo "Removed drawable-v24/ic_launcher_foreground.xml"
fi

echo "All Android launcher icons generated successfully!"

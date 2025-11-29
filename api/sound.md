# 声音API

jvavscratch提供了声音API，使开发者能够控制角色的声音播放、音量和音效等。这些API对应Scratch中的声音类积木。

## 声音播放函数

### playSound

```javascript
// 播放指定声音
sprite.playSound("meow");
sprite.playSound(1); // 也可以使用索引
```

播放指定名称或索引的声音文件。

### playSoundUntilDone

```javascript
// 播放声音直到结束
sprite.playSoundUntilDone("music");
```

播放指定的声音文件，并等待直到声音播放完成。

### stopAllSounds

```javascript
// 停止所有声音
stopAllSounds();
```

停止当前正在播放的所有声音。

## 声音控制函数

### setVolume

```javascript
// 设置音量（百分比）
sprite.setVolume(100); // 默认音量
sprite.setVolume(50); // 音量减半
sprite.setVolume(0); // 静音
```

设置声音的音量，以默认音量的百分比表示。

### changeVolume

```javascript
// 修改音量
sprite.changeVolume(10); // 增加10%
sprite.changeVolume(-20); // 减少20%
```

增加或减少声音的音量。

### volume

```javascript
// 获取或设置音量
const currentVolume = sprite.volume;
sprite.say(`当前音量: ${currentVolume}%`);
```

获取或设置角色的当前音量。

## 音效控制函数

### playDrum

```javascript
// 播放鼓点音效
sprite.playDrum(1, 0.5); // 播放第一个鼓点，持续0.5拍
sprite.playDrum("snare drum", 0.25); // 播放军鼓，持续0.25拍
```

播放指定的鼓点音效，第二个参数是持续时间（拍）。

### playNote

```javascript
// 播放音符
sprite.playNote(60, 0.5); // 播放中央C，持续0.5拍
sprite.playNote("C4", 1); // 播放中央C，持续1拍
```

播放指定的音符，第一个参数可以是音符编号或音符名称，第二个参数是持续时间（拍）。

### rest

```javascript
// 休止符
sprite.rest(1); // 休止1拍
```

插入指定时长的休止符（无声）。

## 声音特效函数

### setInstrument

```javascript
// 设置乐器
sprite.setInstrument(1); // 设置为钢琴
sprite.setInstrument("guitar"); // 设置为吉他
```

设置播放音符时使用的乐器。

### setTempo

```javascript
// 设置 tempo（速度）
setTempo(60); // 设置为每分钟60拍
setTempo(120); // 设置为每分钟120拍
```

设置音乐播放的速度（每分钟节拍数）。

### changeTempo

```javascript
// 修改 tempo
changeTempo(10); // 增加10拍每分钟
changeTempo(-5); // 减少5拍每分钟
```

增加或减少音乐播放的速度。

### tempo

```javascript
// 获取当前 tempo
const currentTempo = tempo;
sprite.say(`当前速度: ${currentTempo}拍/分钟`);
```

获取当前的音乐播放速度。

## 录音和声音侦测

### startSoundRecording

```javascript
// 开始录音
startSoundRecording();
```

开始录制声音。

### stopSoundRecording

```javascript
// 停止录音
const recordedSound = stopSoundRecording();
sprite.playSound(recordedSound);
```

停止录音并返回录制的声音。

### isLoud

```javascript
// 检查是否有声音
if (isLoud()) {
  sprite.say("我听到声音了！");
}
```

检查麦克风是否检测到声音。

### loudness

```javascript
// 获取声音响度
const soundLevel = loudness();
sprite.say(`声音大小: ${soundLevel}`);
```

获取麦克风检测到的声音响度级别。

## 注意事项

1. 使用playSound时，程序会继续执行，不会等待声音播放完成
2. 使用playSoundUntilDone时，程序会暂停直到声音播放完成
3. 确保项目中已添加所需的声音文件
4. 播放音符和使用乐器功能需要MIDI支持
5. 录音功能需要用户授权麦克风访问
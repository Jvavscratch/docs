# 类和继承

jvavscratch支持基本的类和继承功能，允许开发者使用面向对象的方式组织代码。这些类可以转换为Scratch中的自定义积木集合。

## 类的声明

### 基本类定义

```javascript
class Character {
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    sprite.say(`你好，我是${this.name}`);
  }
  
  move(distance) {
    sprite.move(distance);
  }
}

// 创建实例
const hero = new Character("英雄");
hero.sayHello();
hero.move(10);
```

类的方法会被转换为Scratch中的自定义积木，实例变量会被存储在角色的变量中。

### 继承

```javascript
class Enemy extends Character {
  constructor(name, damage) {
    super(name); // 调用父类构造函数
    this.damage = damage;
  }
  
  attack() {
    sprite.say(`攻击！造成${this.damage}点伤害`);
    // 攻击逻辑
  }
}

const boss = new Enemy("大Boss", 50);
boss.sayHello(); // 继承自父类的方法
boss.attack(); // 子类特有的方法
```

子类会继承父类的所有方法，并可以添加自己的方法或覆盖父类方法。

## 静态方法

```javascript
class Utils {
  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  static sayRandom(array) {
    const randomIndex = Utils.randomNumber(0, array.length - 1);
    sprite.say(array[randomIndex]);
  }
}

// 调用静态方法
const num = Utils.randomNumber(1, 10);
Utils.sayRandom(["你好", "欢迎", "再见"]);
```

静态方法可以直接通过类名调用，不需要创建实例。

## getter和setter

```javascript
class Player {
  constructor(name) {
    this._name = name;
    this._score = 0;
  }
  
  get score() {
    return this._score;
  }
  
  set score(value) {
    this._score = value;
    sprite.setVariable("score", value);
  }
  
  increaseScore(points) {
    this.score += points;
    sprite.say(`得分！现在有${this.score}分`);
  }
}

const player = new Player("玩家");
player.increaseScore(10);
```

getter和setter方法可以用来控制属性的访问和修改，在Scratch中可以同步更新角色变量。

## 注意事项

1. 类名应该使用大驼峰命名法
2. 避免使用过于复杂的继承层次
3. 类的方法应该简单明了，便于转换为Scratch积木
4. 类的属性应该合理命名，避免与Scratch保留变量冲突
import{_ as n,c as a,o as l,ag as p}from"./chunks/framework.BkKiziiH.js";const b=JSON.parse('{"title":"API使用示例","description":"","frontmatter":{},"headers":[],"relativePath":"api/examples.md","filePath":"api/examples.md"}'),e={name:"api/examples.md"};function o(r,s,c,t,E,i){return l(),a("div",null,[...s[0]||(s[0]=[p(`<h1 id="api使用示例" tabindex="-1">API使用示例 <a class="header-anchor" href="#api使用示例" aria-label="Permalink to &quot;API使用示例&quot;">​</a></h1><p>本章节提供jvavscratch框架API的完整使用示例，帮助您快速上手和理解如何使用各个功能模块。</p><h2 id="基本转换示例" tabindex="-1">基本转换示例 <a class="header-anchor" href="#基本转换示例" aria-label="Permalink to &quot;基本转换示例&quot;">​</a></h2><h3 id="从javascript到scratch" tabindex="-1">从JavaScript到Scratch <a class="header-anchor" href="#从javascript到scratch" aria-label="Permalink to &quot;从JavaScript到Scratch&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">transform</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">saveProject</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> basicConversion</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#F97583;">  try</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#6A737D;">    // JavaScript代码</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> code</span><span style="color:#F97583;"> =</span><span style="color:#9ECBFF;"> \`</span></span>
<span class="line"><span style="color:#9ECBFF;">      // 当绿旗被点击时执行</span></span>
<span class="line"><span style="color:#9ECBFF;">      whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        // 移动10步</span></span>
<span class="line"><span style="color:#9ECBFF;">        move(10);</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 右转15度</span></span>
<span class="line"><span style="color:#9ECBFF;">        turnRight(15);</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 说&quot;Hello World!&quot;，持续2秒</span></span>
<span class="line"><span style="color:#9ECBFF;">        say(&quot;Hello World!&quot;, 2);</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 重复10次</span></span>
<span class="line"><span style="color:#9ECBFF;">        repeat(10, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">          // 移动5步</span></span>
<span class="line"><span style="color:#9ECBFF;">          move(5);</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 如果碰到边缘就反弹</span></span>
<span class="line"><span style="color:#9ECBFF;">          if(onEdgeBounce(), () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">            // 改变颜色特效</span></span>
<span class="line"><span style="color:#9ECBFF;">            changeEffectBy(&quot;color&quot;, 25);</span></span>
<span class="line"><span style="color:#9ECBFF;">          });</span></span>
<span class="line"><span style="color:#9ECBFF;">        });</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">    \`</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 转换代码</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> project</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> transform</span><span style="color:#E1E4E8;">(code);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 保存为Scratch项目文件</span></span>
<span class="line"><span style="color:#F97583;">    await</span><span style="color:#B392F0;"> saveProject</span><span style="color:#E1E4E8;">(project, </span><span style="color:#9ECBFF;">&#39;./output/basic_project.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;项目转换成功！&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  } </span><span style="color:#F97583;">catch</span><span style="color:#E1E4E8;"> (error) {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">error</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;转换失败:&#39;</span><span style="color:#E1E4E8;">, error);</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">basicConversion</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br></div></div><h3 id="从scratch到javascript" tabindex="-1">从Scratch到JavaScript <a class="header-anchor" href="#从scratch到javascript" aria-label="Permalink to &quot;从Scratch到JavaScript&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">decompileProject</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch/decompiler&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#79B8FF;"> fs</span><span style="color:#F97583;"> =</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;fs&#39;</span><span style="color:#E1E4E8;">).promises;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> basicDecompilation</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#F97583;">  try</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#6A737D;">    // 反编译Scratch项目</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> result</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> decompileProject</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./input/project.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 输出反编译后的JavaScript代码</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(result.code);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 保存代码到文件</span></span>
<span class="line"><span style="color:#F97583;">    await</span><span style="color:#E1E4E8;"> fs.</span><span style="color:#B392F0;">writeFile</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./output/project.js&#39;</span><span style="color:#E1E4E8;">, result.code);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 保存项目元数据</span></span>
<span class="line"><span style="color:#F97583;">    await</span><span style="color:#E1E4E8;"> fs.</span><span style="color:#B392F0;">writeFile</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./output/project_meta.json&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">JSON</span><span style="color:#E1E4E8;">.</span><span style="color:#B392F0;">stringify</span><span style="color:#E1E4E8;">(result.meta, </span><span style="color:#79B8FF;">null</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">));</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;项目反编译成功！&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  } </span><span style="color:#F97583;">catch</span><span style="color:#E1E4E8;"> (error) {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">error</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;反编译失败:&#39;</span><span style="color:#E1E4E8;">, error);</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">basicDecompilation</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><h2 id="高级转换示例" tabindex="-1">高级转换示例 <a class="header-anchor" href="#高级转换示例" aria-label="Permalink to &quot;高级转换示例&quot;">​</a></h2><h3 id="使用自定义组件" tabindex="-1">使用自定义组件 <a class="header-anchor" href="#使用自定义组件" aria-label="Permalink to &quot;使用自定义组件&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">transform</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">registerComponent</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">// 注册自定义组件</span></span>
<span class="line"><span style="color:#B392F0;">registerComponent</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;MySprite&#39;</span><span style="color:#E1E4E8;">, {</span></span>
<span class="line"><span style="color:#E1E4E8;">  name: </span><span style="color:#9ECBFF;">&#39;CustomSprite&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  x: </span><span style="color:#79B8FF;">100</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  y: </span><span style="color:#79B8FF;">50</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  scripts: [</span></span>
<span class="line"><span style="color:#E1E4E8;">    {</span></span>
<span class="line"><span style="color:#E1E4E8;">      name: </span><span style="color:#9ECBFF;">&#39;init&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      code: </span><span style="color:#9ECBFF;">\`</span></span>
<span class="line"><span style="color:#9ECBFF;">        whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">          show();</span></span>
<span class="line"><span style="color:#9ECBFF;">          say(&quot;I&#39;m a custom sprite!&quot;);</span></span>
<span class="line"><span style="color:#9ECBFF;">        });</span></span>
<span class="line"><span style="color:#9ECBFF;">      \`</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">  ]</span></span>
<span class="line"><span style="color:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> useCustomComponent</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> code</span><span style="color:#F97583;"> =</span><span style="color:#9ECBFF;"> \`</span></span>
<span class="line"><span style="color:#9ECBFF;">    // 使用自定义组件</span></span>
<span class="line"><span style="color:#9ECBFF;">    createComponent(&#39;MySprite&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">      // 移动自定义精灵</span></span>
<span class="line"><span style="color:#9ECBFF;">      withSprite(&#39;CustomSprite&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        move(10);</span></span>
<span class="line"><span style="color:#9ECBFF;">        turnRight(90);</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">    });</span></span>
<span class="line"><span style="color:#9ECBFF;">  \`</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> project</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> transform</span><span style="color:#E1E4E8;">(code);</span></span>
<span class="line"><span style="color:#F97583;">  await</span><span style="color:#B392F0;"> saveProject</span><span style="color:#E1E4E8;">(project, </span><span style="color:#9ECBFF;">&#39;./output/custom_component.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">useCustomComponent</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br></div></div><h3 id="使用变量和列表" tabindex="-1">使用变量和列表 <a class="header-anchor" href="#使用变量和列表" aria-label="Permalink to &quot;使用变量和列表&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#79B8FF;"> code</span><span style="color:#F97583;"> =</span><span style="color:#9ECBFF;"> \`</span></span>
<span class="line"><span style="color:#9ECBFF;">  // 定义变量</span></span>
<span class="line"><span style="color:#9ECBFF;">  const score = 0;</span></span>
<span class="line"><span style="color:#9ECBFF;">  let lives = 3;</span></span>
<span class="line"><span style="color:#9ECBFF;">  </span></span>
<span class="line"><span style="color:#9ECBFF;">  // 定义列表</span></span>
<span class="line"><span style="color:#9ECBFF;">  const items = [&#39;apple&#39;, &#39;banana&#39;, &#39;orange&#39;];</span></span>
<span class="line"><span style="color:#9ECBFF;">  </span></span>
<span class="line"><span style="color:#9ECBFF;">  whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">    // 更新变量</span></span>
<span class="line"><span style="color:#9ECBFF;">    score = score + 10;</span></span>
<span class="line"><span style="color:#9ECBFF;">    lives = lives - 1;</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 使用列表</span></span>
<span class="line"><span style="color:#9ECBFF;">    if(contains(items, &#39;apple&#39;), () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">      say(&#39;Found an apple!&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">    });</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 添加项目到列表</span></span>
<span class="line"><span style="color:#9ECBFF;">    addItem(&#39;grape&#39;, items);</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 获取列表长度</span></span>
<span class="line"><span style="color:#9ECBFF;">    const itemCount = lengthOfList(items);</span></span>
<span class="line"><span style="color:#9ECBFF;">    say(&#39;We have &#39; + itemCount + &#39; items!&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">  });</span></span>
<span class="line"><span style="color:#9ECBFF;">\`</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#79B8FF;"> project</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> transform</span><span style="color:#E1E4E8;">(code);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><h3 id="使用广播和事件" tabindex="-1">使用广播和事件 <a class="header-anchor" href="#使用广播和事件" aria-label="Permalink to &quot;使用广播和事件&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#79B8FF;"> code</span><span style="color:#F97583;"> =</span><span style="color:#9ECBFF;"> \`</span></span>
<span class="line"><span style="color:#9ECBFF;">  whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">    // 等待1秒后广播</span></span>
<span class="line"><span style="color:#9ECBFF;">    wait(1);</span></span>
<span class="line"><span style="color:#9ECBFF;">    broadcast(&#39;start_game&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">  });</span></span>
<span class="line"><span style="color:#9ECBFF;">  </span></span>
<span class="line"><span style="color:#9ECBFF;">  // 接收广播</span></span>
<span class="line"><span style="color:#9ECBFF;">  whenIReceive(&#39;start_game&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">    say(&#39;Game started!&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 等待2秒后广播游戏结束</span></span>
<span class="line"><span style="color:#9ECBFF;">    wait(2);</span></span>
<span class="line"><span style="color:#9ECBFF;">    broadcast(&#39;game_over&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">  });</span></span>
<span class="line"><span style="color:#9ECBFF;">  </span></span>
<span class="line"><span style="color:#9ECBFF;">  // 接收游戏结束广播</span></span>
<span class="line"><span style="color:#9ECBFF;">  whenIReceive(&#39;game_over&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">    say(&#39;Game Over!&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">    stopAll();</span></span>
<span class="line"><span style="color:#9ECBFF;">  });</span></span>
<span class="line"><span style="color:#9ECBFF;">\`</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#79B8FF;"> project</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> transform</span><span style="color:#E1E4E8;">(code);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><h2 id="运行时示例" tabindex="-1">运行时示例 <a class="header-anchor" href="#运行时示例" aria-label="Permalink to &quot;运行时示例&quot;">​</a></h2><h3 id="在node-js中模拟运行" tabindex="-1">在Node.js中模拟运行 <a class="header-anchor" href="#在node-js中模拟运行" aria-label="Permalink to &quot;在Node.js中模拟运行&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">Runtime</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch/runtime&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> simulateRuntime</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#6A737D;">  // 创建运行时实例</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> runtime</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> Runtime.</span><span style="color:#B392F0;">create</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">    fps: </span><span style="color:#79B8FF;">60</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    debug: </span><span style="color:#79B8FF;">true</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    width: </span><span style="color:#79B8FF;">480</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    height: </span><span style="color:#79B8FF;">360</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 启动运行时</span></span>
<span class="line"><span style="color:#F97583;">  await</span><span style="color:#E1E4E8;"> runtime.</span><span style="color:#B392F0;">start</span><span style="color:#E1E4E8;">();</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 监听帧更新</span></span>
<span class="line"><span style="color:#E1E4E8;">  runtime.</span><span style="color:#B392F0;">on</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;frame&#39;</span><span style="color:#E1E4E8;">, (</span><span style="color:#FFAB70;">frame</span><span style="color:#E1E4E8;">) </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`Frame: \${</span><span style="color:#E1E4E8;">frame</span><span style="color:#9ECBFF;">}, Score: \${</span><span style="color:#E1E4E8;">runtime</span><span style="color:#9ECBFF;">.</span><span style="color:#B392F0;">getVariable</span><span style="color:#9ECBFF;">(</span><span style="color:#9ECBFF;">&#39;score&#39;</span><span style="color:#9ECBFF;">)</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 执行代码</span></span>
<span class="line"><span style="color:#F97583;">  await</span><span style="color:#E1E4E8;"> runtime.</span><span style="color:#B392F0;">execute</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`</span></span>
<span class="line"><span style="color:#9ECBFF;">    const score = 0;</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">      forever(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        // 每秒增加分数</span></span>
<span class="line"><span style="color:#9ECBFF;">        wait(1);</span></span>
<span class="line"><span style="color:#9ECBFF;">        score = score + 1;</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 每10分改变方向</span></span>
<span class="line"><span style="color:#9ECBFF;">        if(score % 10 === 0, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">          turnRight(90);</span></span>
<span class="line"><span style="color:#9ECBFF;">        });</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 移动</span></span>
<span class="line"><span style="color:#9ECBFF;">        move(5);</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 检测碰撞</span></span>
<span class="line"><span style="color:#9ECBFF;">        if(onEdgeBounce(), () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">          changeSizeBy(-5);</span></span>
<span class="line"><span style="color:#9ECBFF;">        });</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">    });</span></span>
<span class="line"><span style="color:#9ECBFF;">  \`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 5秒后停止</span></span>
<span class="line"><span style="color:#B392F0;">  setTimeout</span><span style="color:#E1E4E8;">(</span><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> () </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;Stopping runtime...&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">    await</span><span style="color:#E1E4E8;"> runtime.</span><span style="color:#B392F0;">stop</span><span style="color:#E1E4E8;">();</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;Final score:&#39;</span><span style="color:#E1E4E8;">, runtime.</span><span style="color:#B392F0;">getVariable</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;score&#39;</span><span style="color:#E1E4E8;">));</span></span>
<span class="line"><span style="color:#E1E4E8;">  }, </span><span style="color:#79B8FF;">5000</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">simulateRuntime</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br></div></div><h3 id="在浏览器中运行" tabindex="-1">在浏览器中运行 <a class="header-anchor" href="#在浏览器中运行" aria-label="Permalink to &quot;在浏览器中运行&quot;">​</a></h3><div class="language-html line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#E1E4E8;">&lt;!</span><span style="color:#85E89D;">DOCTYPE</span><span style="color:#B392F0;"> html</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;</span><span style="color:#85E89D;">html</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;</span><span style="color:#85E89D;">head</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">  &lt;</span><span style="color:#85E89D;">title</span><span style="color:#E1E4E8;">&gt;jvavscratch 浏览器示例&lt;/</span><span style="color:#85E89D;">title</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">  &lt;</span><span style="color:#85E89D;">script</span><span style="color:#B392F0;"> src</span><span style="color:#E1E4E8;">=</span><span style="color:#9ECBFF;">&quot;https://cdn.jsdelivr.net/npm/jvavscratch@latest/dist/jvavscratch.min.js&quot;</span><span style="color:#E1E4E8;">&gt;&lt;/</span><span style="color:#85E89D;">script</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;/</span><span style="color:#85E89D;">head</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;</span><span style="color:#85E89D;">body</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">  &lt;</span><span style="color:#85E89D;">div</span><span style="color:#B392F0;"> id</span><span style="color:#E1E4E8;">=</span><span style="color:#9ECBFF;">&quot;stage&quot;</span><span style="color:#E1E4E8;">&gt;&lt;/</span><span style="color:#85E89D;">div</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#E1E4E8;">  &lt;</span><span style="color:#85E89D;">script</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#F97583;">    async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> runInBrowser</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#6A737D;">      // 创建运行时，绑定到DOM元素</span></span>
<span class="line"><span style="color:#F97583;">      const</span><span style="color:#79B8FF;"> runtime</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> jvavscratch.Runtime.</span><span style="color:#B392F0;">create</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">        container: </span><span style="color:#9ECBFF;">&#39;#stage&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        width: </span><span style="color:#79B8FF;">480</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        height: </span><span style="color:#79B8FF;">360</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        fps: </span><span style="color:#79B8FF;">30</span></span>
<span class="line"><span style="color:#E1E4E8;">      });</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span></span>
<span class="line"><span style="color:#6A737D;">      // 启动运行时</span></span>
<span class="line"><span style="color:#F97583;">      await</span><span style="color:#E1E4E8;"> runtime.</span><span style="color:#B392F0;">start</span><span style="color:#E1E4E8;">();</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span></span>
<span class="line"><span style="color:#6A737D;">      // 执行代码</span></span>
<span class="line"><span style="color:#F97583;">      await</span><span style="color:#E1E4E8;"> runtime.</span><span style="color:#B392F0;">execute</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`</span></span>
<span class="line"><span style="color:#9ECBFF;">        whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">          say(&quot;Hello from browser!&quot;);</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 响应用户交互</span></span>
<span class="line"><span style="color:#9ECBFF;">          whenKeyPressed(&#39;space&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">            say(&quot;Space key pressed!&quot;);</span></span>
<span class="line"><span style="color:#9ECBFF;">            move(10);</span></span>
<span class="line"><span style="color:#9ECBFF;">          });</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          forever(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">            // 跟随鼠标</span></span>
<span class="line"><span style="color:#9ECBFF;">            pointTowards(mouseX(), mouseY());</span></span>
<span class="line"><span style="color:#9ECBFF;">          });</span></span>
<span class="line"><span style="color:#9ECBFF;">        });</span></span>
<span class="line"><span style="color:#9ECBFF;">      \`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 页面加载后运行</span></span>
<span class="line"><span style="color:#E1E4E8;">    window.onload </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> runInBrowser;</span></span>
<span class="line"><span style="color:#E1E4E8;">  &lt;/</span><span style="color:#85E89D;">script</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;/</span><span style="color:#85E89D;">body</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;/</span><span style="color:#85E89D;">html</span><span style="color:#E1E4E8;">&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br></div></div><h2 id="生成器示例" tabindex="-1">生成器示例 <a class="header-anchor" href="#生成器示例" aria-label="Permalink to &quot;生成器示例&quot;">​</a></h2><h3 id="创建自定义scratch项目" tabindex="-1">创建自定义Scratch项目 <a class="header-anchor" href="#创建自定义scratch项目" aria-label="Permalink to &quot;创建自定义Scratch项目&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">generateProject</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">saveProject</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch/generator&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> createCustomProject</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#6A737D;">  // 定义项目结构</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> projectConfig</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    name: </span><span style="color:#9ECBFF;">&#39;我的自定义项目&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    description: </span><span style="color:#9ECBFF;">&#39;使用jvavscratch生成的项目&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    author: </span><span style="color:#9ECBFF;">&#39;开发者&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 背景设置</span></span>
<span class="line"><span style="color:#E1E4E8;">    background: {</span></span>
<span class="line"><span style="color:#E1E4E8;">      name: </span><span style="color:#9ECBFF;">&#39;Stage&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      costumes: [</span></span>
<span class="line"><span style="color:#E1E4E8;">        {</span></span>
<span class="line"><span style="color:#E1E4E8;">          name: </span><span style="color:#9ECBFF;">&#39;background1&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">          assetId: </span><span style="color:#9ECBFF;">&#39;builtin_background1&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">          md5ext: </span><span style="color:#9ECBFF;">&#39;background1.svg&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">          dataFormat: </span><span style="color:#9ECBFF;">&#39;svg&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"><span style="color:#E1E4E8;">      ],</span></span>
<span class="line"><span style="color:#E1E4E8;">      scripts: [</span></span>
<span class="line"><span style="color:#E1E4E8;">        {</span></span>
<span class="line"><span style="color:#E1E4E8;">          blocks: [</span></span>
<span class="line"><span style="color:#E1E4E8;">            { opcode: </span><span style="color:#9ECBFF;">&#39;event_whenflagclicked&#39;</span><span style="color:#E1E4E8;"> },</span></span>
<span class="line"><span style="color:#E1E4E8;">            { opcode: </span><span style="color:#9ECBFF;">&#39;looks_switchbackdropto&#39;</span><span style="color:#E1E4E8;">, inputs: { BACKDROP: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;background1&#39;</span><span style="color:#E1E4E8;">] } }</span></span>
<span class="line"><span style="color:#E1E4E8;">          ]</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"><span style="color:#E1E4E8;">      ]</span></span>
<span class="line"><span style="color:#E1E4E8;">    },</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 精灵列表</span></span>
<span class="line"><span style="color:#E1E4E8;">    sprites: [</span></span>
<span class="line"><span style="color:#E1E4E8;">      {</span></span>
<span class="line"><span style="color:#E1E4E8;">        name: </span><span style="color:#9ECBFF;">&#39;小猫&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        x: </span><span style="color:#79B8FF;">0</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        y: </span><span style="color:#79B8FF;">0</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        size: </span><span style="color:#79B8FF;">100</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        direction: </span><span style="color:#79B8FF;">90</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        rotationStyle: </span><span style="color:#9ECBFF;">&#39;all around&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span></span>
<span class="line"><span style="color:#6A737D;">        // 造型</span></span>
<span class="line"><span style="color:#E1E4E8;">        costumes: [</span></span>
<span class="line"><span style="color:#E1E4E8;">          {</span></span>
<span class="line"><span style="color:#E1E4E8;">            name: </span><span style="color:#9ECBFF;">&#39;costume1&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            assetId: </span><span style="color:#9ECBFF;">&#39;builtin_cat1&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            md5ext: </span><span style="color:#9ECBFF;">&#39;cat1.svg&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            dataFormat: </span><span style="color:#9ECBFF;">&#39;svg&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">          }</span></span>
<span class="line"><span style="color:#E1E4E8;">        ],</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span></span>
<span class="line"><span style="color:#6A737D;">        // 声音</span></span>
<span class="line"><span style="color:#E1E4E8;">        sounds: [</span></span>
<span class="line"><span style="color:#E1E4E8;">          {</span></span>
<span class="line"><span style="color:#E1E4E8;">            name: </span><span style="color:#9ECBFF;">&#39;meow&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            assetId: </span><span style="color:#9ECBFF;">&#39;builtin_meow&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            md5ext: </span><span style="color:#9ECBFF;">&#39;meow.wav&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            dataFormat: </span><span style="color:#9ECBFF;">&#39;wav&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">          }</span></span>
<span class="line"><span style="color:#E1E4E8;">        ],</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span></span>
<span class="line"><span style="color:#6A737D;">        // 变量</span></span>
<span class="line"><span style="color:#E1E4E8;">        variables: [</span></span>
<span class="line"><span style="color:#E1E4E8;">          { name: </span><span style="color:#9ECBFF;">&#39;score&#39;</span><span style="color:#E1E4E8;">, value: </span><span style="color:#79B8FF;">0</span><span style="color:#E1E4E8;">, isGlobal: </span><span style="color:#79B8FF;">false</span><span style="color:#E1E4E8;"> }</span></span>
<span class="line"><span style="color:#E1E4E8;">        ],</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span></span>
<span class="line"><span style="color:#6A737D;">        // 脚本</span></span>
<span class="line"><span style="color:#E1E4E8;">        scripts: [</span></span>
<span class="line"><span style="color:#E1E4E8;">          {</span></span>
<span class="line"><span style="color:#E1E4E8;">            blocks: [</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;event_whenflagclicked&#39;</span><span style="color:#E1E4E8;"> },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;motion_gotoxy&#39;</span><span style="color:#E1E4E8;">, inputs: { X: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">0</span><span style="color:#E1E4E8;">], Y: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">0</span><span style="color:#E1E4E8;">] } },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;looks_sayforsecs&#39;</span><span style="color:#E1E4E8;">, inputs: { MESSAGE: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;大家好！&#39;</span><span style="color:#E1E4E8;">], SECS: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">] } },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;control_repeat&#39;</span><span style="color:#E1E4E8;">, inputs: { TIMES: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">10</span><span style="color:#E1E4E8;">] }, next: </span><span style="color:#79B8FF;">4</span><span style="color:#E1E4E8;"> },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;motion_movesteps&#39;</span><span style="color:#E1E4E8;">, inputs: { STEPS: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">10</span><span style="color:#E1E4E8;">] } },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;motion_turnright&#39;</span><span style="color:#E1E4E8;">, inputs: { DEGREES: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">15</span><span style="color:#E1E4E8;">] } }</span></span>
<span class="line"><span style="color:#E1E4E8;">            ]</span></span>
<span class="line"><span style="color:#E1E4E8;">          },</span></span>
<span class="line"><span style="color:#E1E4E8;">          {</span></span>
<span class="line"><span style="color:#E1E4E8;">            blocks: [</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;event_whenkeypressed&#39;</span><span style="color:#E1E4E8;">, inputs: { KEY_OPTION: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;space&#39;</span><span style="color:#E1E4E8;">] } },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;sound_playuntildone&#39;</span><span style="color:#E1E4E8;">, inputs: { SOUND: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;meow&#39;</span><span style="color:#E1E4E8;">] } },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;data_changevariableby&#39;</span><span style="color:#E1E4E8;">, inputs: { VARIABLE: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;score&#39;</span><span style="color:#E1E4E8;">], VALUE: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">] } }</span></span>
<span class="line"><span style="color:#E1E4E8;">            ]</span></span>
<span class="line"><span style="color:#E1E4E8;">          }</span></span>
<span class="line"><span style="color:#E1E4E8;">        ]</span></span>
<span class="line"><span style="color:#E1E4E8;">      },</span></span>
<span class="line"><span style="color:#E1E4E8;">      {</span></span>
<span class="line"><span style="color:#E1E4E8;">        name: </span><span style="color:#9ECBFF;">&#39;苹果&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        x: </span><span style="color:#79B8FF;">150</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        y: </span><span style="color:#79B8FF;">100</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        size: </span><span style="color:#79B8FF;">50</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span></span>
<span class="line"><span style="color:#E1E4E8;">        costumes: [</span></span>
<span class="line"><span style="color:#E1E4E8;">          {</span></span>
<span class="line"><span style="color:#E1E4E8;">            name: </span><span style="color:#9ECBFF;">&#39;apple&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            assetId: </span><span style="color:#9ECBFF;">&#39;builtin_apple&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            md5ext: </span><span style="color:#9ECBFF;">&#39;apple.svg&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            dataFormat: </span><span style="color:#9ECBFF;">&#39;svg&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">          }</span></span>
<span class="line"><span style="color:#E1E4E8;">        ],</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span></span>
<span class="line"><span style="color:#E1E4E8;">        scripts: [</span></span>
<span class="line"><span style="color:#E1E4E8;">          {</span></span>
<span class="line"><span style="color:#E1E4E8;">            blocks: [</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;event_whenflagclicked&#39;</span><span style="color:#E1E4E8;"> },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;control_forever&#39;</span><span style="color:#E1E4E8;">, next: </span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;"> },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;motion_goto&#39;</span><span style="color:#E1E4E8;">, inputs: { TO: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;random position&#39;</span><span style="color:#E1E4E8;">] } },</span></span>
<span class="line"><span style="color:#E1E4E8;">              { opcode: </span><span style="color:#9ECBFF;">&#39;control_wait&#39;</span><span style="color:#E1E4E8;">, inputs: { DURATION: [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">] } }</span></span>
<span class="line"><span style="color:#E1E4E8;">            ]</span></span>
<span class="line"><span style="color:#E1E4E8;">          }</span></span>
<span class="line"><span style="color:#E1E4E8;">        ]</span></span>
<span class="line"><span style="color:#E1E4E8;">      }</span></span>
<span class="line"><span style="color:#E1E4E8;">    ]</span></span>
<span class="line"><span style="color:#E1E4E8;">  };</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 生成项目</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> project</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> generateProject</span><span style="color:#E1E4E8;">(projectConfig);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 保存项目</span></span>
<span class="line"><span style="color:#F97583;">  await</span><span style="color:#B392F0;"> saveProject</span><span style="color:#E1E4E8;">(project, </span><span style="color:#9ECBFF;">&#39;./output/custom_project.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;自定义项目创建成功！&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">createCustomProject</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br><span class="line-number">115</span><br><span class="line-number">116</span><br><span class="line-number">117</span><br><span class="line-number">118</span><br><span class="line-number">119</span><br><span class="line-number">120</span><br><span class="line-number">121</span><br><span class="line-number">122</span><br><span class="line-number">123</span><br><span class="line-number">124</span><br><span class="line-number">125</span><br></div></div><h2 id="反编译器示例" tabindex="-1">反编译器示例 <a class="header-anchor" href="#反编译器示例" aria-label="Permalink to &quot;反编译器示例&quot;">​</a></h2><h3 id="提取项目资源" tabindex="-1">提取项目资源 <a class="header-anchor" href="#提取项目资源" aria-label="Permalink to &quot;提取项目资源&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">decompileProject</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">extractAssets</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch/decompiler&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> extractProjectResources</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#F97583;">  try</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#6A737D;">    // 提取项目资源</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> assets</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> extractAssets</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./input/project.sb3&#39;</span><span style="color:#E1E4E8;">, {</span></span>
<span class="line"><span style="color:#E1E4E8;">      outputDir: </span><span style="color:#9ECBFF;">&#39;./output/assets&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      includeCostumes: </span><span style="color:#79B8FF;">true</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      includeSounds: </span><span style="color:#79B8FF;">true</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      includeScripts: </span><span style="color:#79B8FF;">false</span></span>
<span class="line"><span style="color:#E1E4E8;">    });</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;资源提取成功！&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;提取的造型数量:&#39;</span><span style="color:#E1E4E8;">, assets.costumes.</span><span style="color:#79B8FF;">length</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;提取的声音数量:&#39;</span><span style="color:#E1E4E8;">, assets.sounds.</span><span style="color:#79B8FF;">length</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 输出资源信息</span></span>
<span class="line"><span style="color:#E1E4E8;">    assets.costumes.</span><span style="color:#B392F0;">forEach</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">costume</span><span style="color:#F97583;"> =&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`造型: \${</span><span style="color:#E1E4E8;">costume</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">name</span><span style="color:#9ECBFF;">}, 格式: \${</span><span style="color:#E1E4E8;">costume</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">dataFormat</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    });</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#E1E4E8;">    assets.sounds.</span><span style="color:#B392F0;">forEach</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">sound</span><span style="color:#F97583;"> =&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`声音: \${</span><span style="color:#E1E4E8;">sound</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">name</span><span style="color:#9ECBFF;">}, 格式: \${</span><span style="color:#E1E4E8;">sound</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">dataFormat</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    });</span></span>
<span class="line"><span style="color:#E1E4E8;">  } </span><span style="color:#F97583;">catch</span><span style="color:#E1E4E8;"> (error) {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">error</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;资源提取失败:&#39;</span><span style="color:#E1E4E8;">, error);</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">extractProjectResources</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><h3 id="分析项目结构" tabindex="-1">分析项目结构 <a class="header-anchor" href="#分析项目结构" aria-label="Permalink to &quot;分析项目结构&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">analyzeProject</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch/decompiler&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> analyzeProjectStructure</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#F97583;">  try</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#6A737D;">    // 分析项目结构</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> analysis</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> analyzeProject</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./input/project.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;项目分析结果:&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;项目名称:&#39;</span><span style="color:#E1E4E8;">, analysis.name);</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;精灵数量:&#39;</span><span style="color:#E1E4E8;">, analysis.sprites.</span><span style="color:#79B8FF;">length</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;变量数量:&#39;</span><span style="color:#E1E4E8;">, analysis.variables.</span><span style="color:#79B8FF;">length</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;列表数量:&#39;</span><span style="color:#E1E4E8;">, analysis.lists.</span><span style="color:#79B8FF;">length</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;广播消息数量:&#39;</span><span style="color:#E1E4E8;">, analysis.broadcasts.</span><span style="color:#79B8FF;">length</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 输出精灵详情</span></span>
<span class="line"><span style="color:#E1E4E8;">    analysis.sprites.</span><span style="color:#B392F0;">forEach</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">sprite</span><span style="color:#F97583;"> =&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`</span><span style="color:#79B8FF;">\\n</span><span style="color:#9ECBFF;">精灵: \${</span><span style="color:#E1E4E8;">sprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">name</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`  脚本数量: \${</span><span style="color:#E1E4E8;">sprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">scripts</span><span style="color:#9ECBFF;">.</span><span style="color:#79B8FF;">length</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`  造型数量: \${</span><span style="color:#E1E4E8;">sprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">costumes</span><span style="color:#9ECBFF;">.</span><span style="color:#79B8FF;">length</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`  声音数量: \${</span><span style="color:#E1E4E8;">sprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">sounds</span><span style="color:#9ECBFF;">.</span><span style="color:#79B8FF;">length</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`  变量数量: \${</span><span style="color:#E1E4E8;">sprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">variables</span><span style="color:#9ECBFF;">.</span><span style="color:#79B8FF;">length</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    });</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#E1E4E8;">  } </span><span style="color:#F97583;">catch</span><span style="color:#E1E4E8;"> (error) {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">error</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;项目分析失败:&#39;</span><span style="color:#E1E4E8;">, error);</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">analyzeProjectStructure</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><h2 id="工具函数示例" tabindex="-1">工具函数示例 <a class="header-anchor" href="#工具函数示例" aria-label="Permalink to &quot;工具函数示例&quot;">​</a></h2><h3 id="文件操作" tabindex="-1">文件操作 <a class="header-anchor" href="#文件操作" aria-label="Permalink to &quot;文件操作&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">utils</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> fileOperations</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#6A737D;">  // 读取项目文件</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> projectData</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#E1E4E8;"> utils.files.</span><span style="color:#B392F0;">readSb3File</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./input/project.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 写入文件</span></span>
<span class="line"><span style="color:#F97583;">  await</span><span style="color:#E1E4E8;"> utils.files.</span><span style="color:#B392F0;">writeFile</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./output/copy.sb3&#39;</span><span style="color:#E1E4E8;">, projectData);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 解压.sb3文件（ZIP格式）</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> extracted</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#E1E4E8;"> utils.files.</span><span style="color:#B392F0;">unzip</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./input/project.sb3&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;./output/unzipped&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;解压的文件数量:&#39;</span><span style="color:#E1E4E8;">, extracted.</span><span style="color:#79B8FF;">length</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 压缩文件（创建.sb3文件）</span></span>
<span class="line"><span style="color:#F97583;">  await</span><span style="color:#E1E4E8;"> utils.files.</span><span style="color:#B392F0;">zip</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./output/unzipped&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;./output/repackaged.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">fileOperations</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h3 id="路径工具" tabindex="-1">路径工具 <a class="header-anchor" href="#路径工具" aria-label="Permalink to &quot;路径工具&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">utils</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#B392F0;"> pathOperations</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#6A737D;">  // 标准化路径</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> normalized</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.path.</span><span style="color:#B392F0;">normalize</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./../folder/file.txt&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 连接路径</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> joined</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.path.</span><span style="color:#B392F0;">join</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./folder&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;subfolder&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;file.txt&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 获取目录名</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> dirname</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.path.</span><span style="color:#B392F0;">dirname</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./folder/file.txt&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 获取文件名</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> basename</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.path.</span><span style="color:#B392F0;">basename</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./folder/file.txt&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 获取扩展名</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> extname</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.path.</span><span style="color:#B392F0;">extname</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;./folder/file.txt&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;标准化路径:&#39;</span><span style="color:#E1E4E8;">, normalized);</span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;连接路径:&#39;</span><span style="color:#E1E4E8;">, joined);</span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;目录名:&#39;</span><span style="color:#E1E4E8;">, dirname);</span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;文件名:&#39;</span><span style="color:#E1E4E8;">, basename);</span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;扩展名:&#39;</span><span style="color:#E1E4E8;">, extname);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">pathOperations</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><h3 id="代码工具" tabindex="-1">代码工具 <a class="header-anchor" href="#代码工具" aria-label="Permalink to &quot;代码工具&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">utils</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#B392F0;"> codeOperations</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> code</span><span style="color:#F97583;"> =</span><span style="color:#9ECBFF;"> \`</span></span>
<span class="line"><span style="color:#9ECBFF;">    whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">      move(10);</span></span>
<span class="line"><span style="color:#9ECBFF;">      say(&quot;Hello&quot;);</span></span>
<span class="line"><span style="color:#9ECBFF;">    });</span></span>
<span class="line"><span style="color:#9ECBFF;">  \`</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 代码格式化</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> formatted</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.code.</span><span style="color:#B392F0;">format</span><span style="color:#E1E4E8;">(code);</span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;格式化后的代码:&#39;</span><span style="color:#E1E4E8;">, formatted);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 代码压缩</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> minified</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.code.</span><span style="color:#B392F0;">minify</span><span style="color:#E1E4E8;">(code);</span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;压缩后的代码:&#39;</span><span style="color:#E1E4E8;">, minified);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 代码验证</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> validation</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> utils.code.</span><span style="color:#B392F0;">validate</span><span style="color:#E1E4E8;">(code);</span></span>
<span class="line"><span style="color:#F97583;">  if</span><span style="color:#E1E4E8;"> (validation.valid) {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;代码验证通过&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  } </span><span style="color:#F97583;">else</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;代码验证失败:&#39;</span><span style="color:#E1E4E8;">, validation.errors);</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">codeOperations</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><h2 id="类型系统示例" tabindex="-1">类型系统示例 <a class="header-anchor" href="#类型系统示例" aria-label="Permalink to &quot;类型系统示例&quot;">​</a></h2><h3 id="使用typescript" tabindex="-1">使用TypeScript <a class="header-anchor" href="#使用typescript" aria-label="Permalink to &quot;使用TypeScript&quot;">​</a></h3><div class="language-typescript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">  Project,</span></span>
<span class="line"><span style="color:#E1E4E8;">  Sprite,</span></span>
<span class="line"><span style="color:#E1E4E8;">  Block,</span></span>
<span class="line"><span style="color:#E1E4E8;">  Variable,</span></span>
<span class="line"><span style="color:#E1E4E8;">  TransformOptions,</span></span>
<span class="line"><span style="color:#E1E4E8;">  JvavError</span></span>
<span class="line"><span style="color:#E1E4E8;">} </span><span style="color:#F97583;">from</span><span style="color:#9ECBFF;"> &#39;jvavscratch&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> { transform } </span><span style="color:#F97583;">from</span><span style="color:#9ECBFF;"> &#39;jvavscratch/core&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> typescriptExample</span><span style="color:#E1E4E8;">()</span><span style="color:#F97583;">:</span><span style="color:#B392F0;"> Promise</span><span style="color:#E1E4E8;">&lt;</span><span style="color:#B392F0;">Project</span><span style="color:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="color:#F97583;">  try</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#6A737D;">    // 定义转换选项</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> options</span><span style="color:#F97583;">:</span><span style="color:#B392F0;"> TransformOptions</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">      strict: </span><span style="color:#79B8FF;">true</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      targetVersion: </span><span style="color:#9ECBFF;">&#39;3.0&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      generateComments: </span><span style="color:#79B8FF;">true</span></span>
<span class="line"><span style="color:#E1E4E8;">    };</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 转换代码</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> project</span><span style="color:#F97583;">:</span><span style="color:#B392F0;"> Project</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> transform</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">      code: </span><span style="color:#9ECBFF;">\`whenGreenFlag(() =&gt; { move(10); })\`</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      options</span></span>
<span class="line"><span style="color:#E1E4E8;">    });</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">    // 使用类型安全的操作</span></span>
<span class="line"><span style="color:#F97583;">    const</span><span style="color:#79B8FF;"> catSprite</span><span style="color:#F97583;">:</span><span style="color:#B392F0;"> Sprite</span><span style="color:#F97583;"> |</span><span style="color:#79B8FF;"> undefined</span><span style="color:#F97583;"> =</span><span style="color:#E1E4E8;"> project.sprites.</span><span style="color:#B392F0;">find</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">s</span><span style="color:#F97583;"> =&gt;</span><span style="color:#E1E4E8;"> s.name </span><span style="color:#F97583;">===</span><span style="color:#9ECBFF;"> &#39;Cat&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#F97583;">    if</span><span style="color:#E1E4E8;"> (catSprite) {</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`找到精灵: \${</span><span style="color:#E1E4E8;">catSprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">name</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`位置: (\${</span><span style="color:#E1E4E8;">catSprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">x</span><span style="color:#9ECBFF;">}, \${</span><span style="color:#E1E4E8;">catSprite</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">y</span><span style="color:#9ECBFF;">})\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#F97583;">    return</span><span style="color:#E1E4E8;"> project;</span></span>
<span class="line"><span style="color:#E1E4E8;">  } </span><span style="color:#F97583;">catch</span><span style="color:#E1E4E8;"> (</span><span style="color:#FFAB70;">error</span><span style="color:#F97583;">:</span><span style="color:#79B8FF;"> any</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#F97583;">    if</span><span style="color:#E1E4E8;"> (error </span><span style="color:#F97583;">instanceof</span><span style="color:#B392F0;"> JvavError</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">error</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`jvavscratch错误: \${</span><span style="color:#E1E4E8;">error</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">message</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">      console.</span><span style="color:#B392F0;">error</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">\`错误代码: \${</span><span style="color:#E1E4E8;">error</span><span style="color:#9ECBFF;">.</span><span style="color:#E1E4E8;">code</span><span style="color:#9ECBFF;">}\`</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#F97583;">    throw</span><span style="color:#E1E4E8;"> error;</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">typescriptExample</span><span style="color:#E1E4E8;">().</span><span style="color:#B392F0;">catch</span><span style="color:#E1E4E8;">(console.error);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br></div></div><h2 id="完整项目示例" tabindex="-1">完整项目示例 <a class="header-anchor" href="#完整项目示例" aria-label="Permalink to &quot;完整项目示例&quot;">​</a></h2><h3 id="游戏开发示例" tabindex="-1">游戏开发示例 <a class="header-anchor" href="#游戏开发示例" aria-label="Permalink to &quot;游戏开发示例&quot;">​</a></h3><div class="language-javascript line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki github-dark vp-code" tabindex="0"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> { </span><span style="color:#79B8FF;">transform</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">saveProject</span><span style="color:#E1E4E8;"> } </span><span style="color:#F97583;">=</span><span style="color:#B392F0;"> require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;jvavscratch&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#F97583;"> function</span><span style="color:#B392F0;"> createGame</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> gameCode</span><span style="color:#F97583;"> =</span><span style="color:#9ECBFF;"> \`</span></span>
<span class="line"><span style="color:#9ECBFF;">    // 游戏变量</span></span>
<span class="line"><span style="color:#9ECBFF;">    const score = 0;</span></span>
<span class="line"><span style="color:#9ECBFF;">    let lives = 3;</span></span>
<span class="line"><span style="color:#9ECBFF;">    const gameOver = false;</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 角色位置</span></span>
<span class="line"><span style="color:#9ECBFF;">    let playerX = 0;</span></span>
<span class="line"><span style="color:#9ECBFF;">    let playerY = -150;</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 敌人列表</span></span>
<span class="line"><span style="color:#9ECBFF;">    const enemies = [];</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 初始化游戏</span></span>
<span class="line"><span style="color:#9ECBFF;">    function initGame() {</span></span>
<span class="line"><span style="color:#9ECBFF;">      // 创建敌人</span></span>
<span class="line"><span style="color:#9ECBFF;">      for(let i = 0; i &lt; 5; i++) {</span></span>
<span class="line"><span style="color:#9ECBFF;">        addItem({</span></span>
<span class="line"><span style="color:#9ECBFF;">          x: -200 + i * 100,</span></span>
<span class="line"><span style="color:#9ECBFF;">          y: 150,</span></span>
<span class="line"><span style="color:#9ECBFF;">          speed: 2 + random(3)</span></span>
<span class="line"><span style="color:#9ECBFF;">        }, enemies);</span></span>
<span class="line"><span style="color:#9ECBFF;">      }</span></span>
<span class="line"><span style="color:#9ECBFF;">    }</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 更新敌人</span></span>
<span class="line"><span style="color:#9ECBFF;">    function updateEnemies() {</span></span>
<span class="line"><span style="color:#9ECBFF;">      forEach(enemies, (enemy, index) =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        // 移动敌人</span></span>
<span class="line"><span style="color:#9ECBFF;">        enemy.x = enemy.x + enemy.speed;</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 如果敌人到达边缘，反向移动并向下移动</span></span>
<span class="line"><span style="color:#9ECBFF;">        if(enemy.x &gt; 240 || enemy.x &lt; -240) {</span></span>
<span class="line"><span style="color:#9ECBFF;">          enemy.speed = -enemy.speed;</span></span>
<span class="line"><span style="color:#9ECBFF;">          enemy.y = enemy.y - 20;</span></span>
<span class="line"><span style="color:#9ECBFF;">        }</span></span>
<span class="line"><span style="color:#9ECBFF;">        </span></span>
<span class="line"><span style="color:#9ECBFF;">        // 如果敌人到达底部，减少生命值</span></span>
<span class="line"><span style="color:#9ECBFF;">        if(enemy.y &lt; -180) {</span></span>
<span class="line"><span style="color:#9ECBFF;">          lives = lives - 1;</span></span>
<span class="line"><span style="color:#9ECBFF;">          deleteItemAt(index, enemies);</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 添加新敌人</span></span>
<span class="line"><span style="color:#9ECBFF;">          addItem({</span></span>
<span class="line"><span style="color:#9ECBFF;">            x: random(-200, 200),</span></span>
<span class="line"><span style="color:#9ECBFF;">            y: 150,</span></span>
<span class="line"><span style="color:#9ECBFF;">            speed: 2 + random(3)</span></span>
<span class="line"><span style="color:#9ECBFF;">          }, enemies);</span></span>
<span class="line"><span style="color:#9ECBFF;">        }</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">    }</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 检查碰撞</span></span>
<span class="line"><span style="color:#9ECBFF;">    function checkCollisions() {</span></span>
<span class="line"><span style="color:#9ECBFF;">      forEach(enemies, (enemy, index) =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        if(distanceBetween(enemy.x, enemy.y, playerX, playerY) &lt; 30) {</span></span>
<span class="line"><span style="color:#9ECBFF;">          // 增加分数</span></span>
<span class="line"><span style="color:#9ECBFF;">          score = score + 10;</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 删除被击中的敌人</span></span>
<span class="line"><span style="color:#9ECBFF;">          deleteItemAt(index, enemies);</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 添加新敌人</span></span>
<span class="line"><span style="color:#9ECBFF;">          addItem({</span></span>
<span class="line"><span style="color:#9ECBFF;">            x: random(-200, 200),</span></span>
<span class="line"><span style="color:#9ECBFF;">            y: 150,</span></span>
<span class="line"><span style="color:#9ECBFF;">            speed: 2 + random(3)</span></span>
<span class="line"><span style="color:#9ECBFF;">          }, enemies);</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 播放音效</span></span>
<span class="line"><span style="color:#9ECBFF;">          playSound(&#39;pop&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">        }</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">    }</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 检查游戏是否结束</span></span>
<span class="line"><span style="color:#9ECBFF;">    function checkGameOver() {</span></span>
<span class="line"><span style="color:#9ECBFF;">      if(lives &lt;= 0) {</span></span>
<span class="line"><span style="color:#9ECBFF;">        gameOver = true;</span></span>
<span class="line"><span style="color:#9ECBFF;">        broadcast(&#39;game_over&#39;);</span></span>
<span class="line"><span style="color:#9ECBFF;">      }</span></span>
<span class="line"><span style="color:#9ECBFF;">    }</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 玩家控制</span></span>
<span class="line"><span style="color:#9ECBFF;">    function playerControl() {</span></span>
<span class="line"><span style="color:#9ECBFF;">      // 左右移动</span></span>
<span class="line"><span style="color:#9ECBFF;">      if(keyPressed(&#39;right&#39;), () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        playerX = min(playerX + 5, 240);</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">      </span></span>
<span class="line"><span style="color:#9ECBFF;">      if(keyPressed(&#39;left&#39;), () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        playerX = max(playerX - 5, -240);</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">    }</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 主游戏循环</span></span>
<span class="line"><span style="color:#9ECBFF;">    function gameLoop() {</span></span>
<span class="line"><span style="color:#9ECBFF;">      forever(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">        if(not(gameOver), () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">          // 更新游戏状态</span></span>
<span class="line"><span style="color:#9ECBFF;">          playerControl();</span></span>
<span class="line"><span style="color:#9ECBFF;">          updateEnemies();</span></span>
<span class="line"><span style="color:#9ECBFF;">          checkCollisions();</span></span>
<span class="line"><span style="color:#9ECBFF;">          checkGameOver();</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 更新显示</span></span>
<span class="line"><span style="color:#9ECBFF;">          withSprite(&#39;Player&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">            setX(playerX);</span></span>
<span class="line"><span style="color:#9ECBFF;">            setY(playerY);</span></span>
<span class="line"><span style="color:#9ECBFF;">          });</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 更新敌人显示</span></span>
<span class="line"><span style="color:#9ECBFF;">          forEach(enemies, (enemy, index) =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">            withSprite(&#39;Enemy&#39; + index, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">              setX(enemy.x);</span></span>
<span class="line"><span style="color:#9ECBFF;">              setY(enemy.y);</span></span>
<span class="line"><span style="color:#9ECBFF;">            });</span></span>
<span class="line"><span style="color:#9ECBFF;">          });</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 更新分数显示</span></span>
<span class="line"><span style="color:#9ECBFF;">          say(&#39;分数: &#39; + score + &#39; 生命: &#39; + lives);</span></span>
<span class="line"><span style="color:#9ECBFF;">          </span></span>
<span class="line"><span style="color:#9ECBFF;">          // 控制游戏速度</span></span>
<span class="line"><span style="color:#9ECBFF;">          wait(0.016); // 约60FPS</span></span>
<span class="line"><span style="color:#9ECBFF;">        });</span></span>
<span class="line"><span style="color:#9ECBFF;">      });</span></span>
<span class="line"><span style="color:#9ECBFF;">    }</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 游戏开始</span></span>
<span class="line"><span style="color:#9ECBFF;">    whenGreenFlag(() =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">      initGame();</span></span>
<span class="line"><span style="color:#9ECBFF;">      gameLoop();</span></span>
<span class="line"><span style="color:#9ECBFF;">    });</span></span>
<span class="line"><span style="color:#9ECBFF;">    </span></span>
<span class="line"><span style="color:#9ECBFF;">    // 游戏结束处理</span></span>
<span class="line"><span style="color:#9ECBFF;">    whenIReceive(&#39;game_over&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#9ECBFF;">      say(&#39;游戏结束！最终分数: &#39; + score);</span></span>
<span class="line"><span style="color:#9ECBFF;">      stopAll();</span></span>
<span class="line"><span style="color:#9ECBFF;">    });</span></span>
<span class="line"><span style="color:#9ECBFF;">  \`</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#6A737D;">  // 转换并保存游戏</span></span>
<span class="line"><span style="color:#F97583;">  const</span><span style="color:#79B8FF;"> project</span><span style="color:#F97583;"> =</span><span style="color:#F97583;"> await</span><span style="color:#B392F0;"> transform</span><span style="color:#E1E4E8;">(gameCode);</span></span>
<span class="line"><span style="color:#F97583;">  await</span><span style="color:#B392F0;"> saveProject</span><span style="color:#E1E4E8;">(project, </span><span style="color:#9ECBFF;">&#39;./output/shooter_game.sb3&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span></span>
<span class="line"><span style="color:#E1E4E8;">  console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;游戏项目创建成功！&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">createGame</span><span style="color:#E1E4E8;">();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br><span class="line-number">115</span><br><span class="line-number">116</span><br><span class="line-number">117</span><br><span class="line-number">118</span><br><span class="line-number">119</span><br><span class="line-number">120</span><br><span class="line-number">121</span><br><span class="line-number">122</span><br><span class="line-number">123</span><br><span class="line-number">124</span><br><span class="line-number">125</span><br><span class="line-number">126</span><br><span class="line-number">127</span><br><span class="line-number">128</span><br><span class="line-number">129</span><br><span class="line-number">130</span><br><span class="line-number">131</span><br><span class="line-number">132</span><br><span class="line-number">133</span><br><span class="line-number">134</span><br><span class="line-number">135</span><br><span class="line-number">136</span><br><span class="line-number">137</span><br><span class="line-number">138</span><br><span class="line-number">139</span><br><span class="line-number">140</span><br><span class="line-number">141</span><br><span class="line-number">142</span><br><span class="line-number">143</span><br><span class="line-number">144</span><br><span class="line-number">145</span><br><span class="line-number">146</span><br><span class="line-number">147</span><br><span class="line-number">148</span><br><span class="line-number">149</span><br><span class="line-number">150</span><br><span class="line-number">151</span><br><span class="line-number">152</span><br></div></div><h2 id="下一步" tabindex="-1">下一步 <a class="header-anchor" href="#下一步" aria-label="Permalink to &quot;下一步&quot;">​</a></h2><ul><li><a href="./">查看API参考文档</a></li><li><a href="./../guide/tutorials.html">探索更多教程</a></li><li><a href="./../advanced/">了解高级功能</a></li></ul>`,42)])])}const F=n(e,[["render",o]]);export{b as __pageData,F as default};

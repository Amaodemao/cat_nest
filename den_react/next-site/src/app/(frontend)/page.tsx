import Image from 'next/image'

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="avatar-wrap">
          <Image
            alt=""
            className="avatar"
            height={180}
            priority
            sizes="180px"
            src="/img/avatar-256.jpg"
            width={180}
          />
          <span className="avatar-shadow" aria-hidden="true" />
        </div>
        <h1 id="hero-title">Hi, I&apos;m Amao</h1>
        <p>你好，我是阿猫</p>

        <div className="palette" aria-label="site color palette">
          <div className="swatch swatch-bg">
            <span>#fbf7e6</span>
          </div>
          <div className="swatch swatch-text">
            <span>#48466b</span>
          </div>
          <div className="swatch swatch-blue">
            <span>#7596be</span>
          </div>
          <div className="swatch swatch-yellow">
            <span>#fbd621</span>
          </div>
          <div className="swatch swatch-peach">
            <span>#fabe9c</span>
          </div>
          <div className="swatch swatch-red">
            <span>#df5f46</span>
          </div>
        </div>
      </section>

      <section className="container" id="about" aria-labelledby="about-title">
        <h2 id="about-title">About Me</h2>
        <div className="card">
          <p>
            我叫<strong>阿猫的猫</strong>，叫我阿猫就可以。
            <br />
            是的，我的物种是猫，请不要再把我画成狗了。 <br />
          </p>
          <p>很高兴认识你！</p>
          <div className="flex home-tags">
            <span className="tag tag-blue">researching</span>
            <span className="tag">eating</span>
            <span className="tag tag-peach">traveling</span>
            <span className="tag tag-red">sleeping</span>
          </div>
        </div>
      </section>
    </>
  )
}

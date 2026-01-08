export default function Home() {
    return (
        <>
            <section className="hero" aria-labelledby="hero-title">
                <div className="avatar-wrap">
                    <img className="avatar" src="img/avatar.png" alt=""/>
                    <span className="avatar-shadow" aria-hidden="true"></span>
                </div>
                <h1 id="hero-title">Hi, I'm Amao</h1>
                <p>你好，我是阿猫</p>

                <div className="palette" aria-label="site color palette">
                    <div className="swatch" style={{background:'var(--bg)'}}><span>#fbf7e6</span></div>
                    <div className="swatch" style={{background:'var(--text)', color:'#fff'}}><span>#48466b</span></div>
                    <div className="swatch" style={{background:'var(--blue)'}}><span>#7596be</span></div>
                    <div className="swatch" style={{background:'var(--yellow'}}><span>#fbd621</span></div>
                    <div className="swatch" style={{background:'var(--peach)'}}><span>#fabe9c</span></div>
                    <div className="swatch" style={{background:'var(--red)', color:'#fff'}}><span>#df5f46</span></div>
                </div>
            </section>

            <section id="about" className="container" aria-labelledby="about-title">
                <h2 id="about-title">About Me</h2>
                <div className="card">
                    <p>
                        我叫<strong>阿猫的猫</strong>，叫我阿猫就可以。<br/>
                        是的，我的物种是猫，请不要再把我画成狗了。 <br/>
                    </p>
                    <p>很高兴认识你！</p>
                    <div className="flex" style={{flexWrap:"wrap", marginTop:"1rem"}}>
                        <span className="tag" style={{background:"var(--blue)", color:"var(--bg)"}}>researching</span>
                        <span className="tag" style={{background:"var(--yellow)"}}>eating</span>
                        <span className="tag" style={{background:"var(--peach)"}}>traveling</span>
                        <span className="tag" style={{background:"var(--red)", color:"#fff"}}>sleeping</span>
                    </div>
                </div>
            </section>
        </>
    );
}
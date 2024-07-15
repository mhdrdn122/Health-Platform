import React from "react";
import Doctor from "../Assets/doctor-group.png";
import SolutionStep from "./SolutionStep";
import "../Styles/About.css";

function About() {
  return (
    <div className="about-section" id="about">
      <div className="about-image-content">
        <img src={Doctor} alt="Doctor Group" className="about-image1" />
      </div>

      <div className="about-text-content">
        <h3 className="about-title">
          <span>من نحن</span>
        </h3>
        <p className="about-description">
        ‏مرحبا بك في هيلث بلس، شريكك الموثوق به للحصول على رعاية صحية يمكن الوصول إليها عبر الانترنت. يقدم أطباؤنا الخبراء استشارات وخدمات متخصصة عبر الإنترنت ، مع إعطاء الأولوية لرفاهيتك. انضم إلينا في هذه الرحلة نحو صحة أفضل.‏


        </p>

        <h4 className="about-text-title">حلولك</h4>

        <SolutionStep
          title="اختر طبيبا"
          description="‏اعثر على أخصائيك المثالي واحجز بكل سهولة في هيلث بلس. يعطي الأطباء الخبراء الأولوية لصحتك ، ويقدمون رعاية مخصصة.‏"
        />

        <SolutionStep
          title="ضع جدولا زمنيا"
          description="اختر التاريخ والوقت الذي يناسبك ، ودع فريقنا المتخصص من المهنيين الطبيين يضمن رفاهيتك من خلال الرعاية الشخصية.‏"/>

        <SolutionStep
          title="‏احصل على حلولك"
          description="‏أطباؤنا وأخصائيونا ذوو الخبرة موجودون هنا لتقديم مشورة الخبراء وخطط العلاج الشخصية ، مما يساعدك على تحقيق أفضل صحة ممكن"
        />
      </div>
    </div>
  );
}

export default About;

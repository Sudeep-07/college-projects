import styles from './ProjectsStyles.module.css';
import beaton from '../../assets/beat-on.png';
import whatsApp from '../../assets/whatsApp.png';
import netflix from '../../assets/netflix logo.png';
import family from '../../assets/family.png';
import weather from '../../assets/weather.png';
import ProjectCard from '../../common/ProjectCard';
import pdf from '../../assets/Sudeeps Project report.pdf';

function Projects() {
  return (
    <section id="projects" className={styles.container}>
      <h1 className="sectionTitle">Projects</h1>
      <div className={styles.projectsContainer}>
        <ProjectCard
          src={beaton}
          link="https://beathop.freewebhostmost.com/"
          h3="beat-on"
          p="Music Streaming App"
        />
        <ProjectCard
          src={whatsApp}
          link={pdf}
          h3="Webhook"
          p="WhatsApp Chatbot"
        />
        <ProjectCard
          src={family}
          link="https://github.com/Sudeep-07/WD/tree/main/back%20end%20development/postgreSQL/8.5%2BFamily%2BTravel%2BTracker/8.5%20Family%20Travel%20Tracker"
          h3="WanderNest"
          p="Family Travel Tracker"
        />
        <ProjectCard
          src={netflix}
          link="https://github.com/Sudeep-07/projects/tree/main/NETFLIX"
          h3="Netflix"
          p="Netflix Clone"
        />
        <ProjectCard
          src={weather}
          link="https://github.com/Sudeep-07/projects/tree/main/weatherApp"
          h3="SkyCast"
          p="Weather Forecast"
        />
      </div>
    </section>
  );
}

export default Projects;

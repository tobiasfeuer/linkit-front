import { useTranslation } from "react-i18next"
import PhotosCarousel from "../../../../Utils/photosCarousel/photosCarousel"
import teamMembers from "../../../../Utils/TeamMembers.json"
import { Link } from "react-router-dom"

type TeamMember = {
  id: number
  link: string
  img: string
  name: string
  position: string
}

const members = teamMembers as TeamMember[]
const leadership = members.slice(0, 3)
const team = members.slice(3)

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex flex-col items-center gap-3 text-center leading-tight">
      <img
        src={member.img}
        alt={member.name}
        className="aspect-square w-full max-w-[200px] rounded-xl bg-linkIt-500 object-cover object-top"
      />
      <div className="flex flex-col gap-1 px-1">
        <Link
          target="_blank"
          to={member.link}
          className="subtitles-size text-center font-montserrat font-bold dark:text-white"
        >
          {member.name}
        </Link>
        <span className="text-size font-montserrat font-normal dark:text-white">{member.position}</span>
      </div>
    </article>
  )
}

function TeamGrid({ members: gridMembers }: { members: TeamMember[] }) {
  return (
    <div className="mx-[5%] my-[5%] grid grid-cols-3 items-start gap-x-[5%] gap-y-10 dark:text-white">
      {gridMembers.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}

export default function ModuloG() {
  const { t } = useTranslation()

  return (
    <div className="relative z-[10] grid bg-white p-[7%] dark:bg-linkIt-300">
      <h3 className="titles-size justify-self-center text-center font-manrope font-bold text-black dark:text-white">
        {t("Conoce a alguno de los integrantes de nuestro equipo")}
      </h3>

      <div className="hidden lg:block">
        <TeamGrid members={leadership} />
        <TeamGrid members={team} />
      </div>

      <div className="lg:hidden">
        <PhotosCarousel arrayOfMembers={members} bgColor="gray" />
      </div>
    </div>
  )
}

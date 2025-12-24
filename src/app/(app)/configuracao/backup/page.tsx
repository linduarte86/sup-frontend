import BackupRestory from "@/app/components/backup/BackupRestory"
import style from "./style.module.scss"

export default function Page() {
  return (
    <main className={style.container}>
      <div className={style.titulo}>
        <h1>Backup</h1>
      </div>

      <div className= {style.backup}>
        <BackupRestory />
      </div>

    </main>
  )
}
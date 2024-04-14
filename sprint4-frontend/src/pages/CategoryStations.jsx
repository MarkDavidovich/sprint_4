import { useParams } from "react-router"
// import { categoryService } from "../services/category.service.local"
import { categoryService } from "../services/category.service"
import { useEffect, useState } from "react"
import { StationList } from "../cmps/StationList"

export function CategoryStations() {
    const { id } = useParams()
    const [category, setCategory] = useState(null)


    useEffect(() => {

        async function getCategoryById() {
            try {
                const fetchedCategory = await categoryService.getById(id)
                setCategory(fetchedCategory)
            } catch (err) {
                console.log('Cannot get category by Id')
            }
        }

        if (id) {
            getCategoryById()
        }

    }, [id])

    if (!category) return <div>Loading...</div>
    return <div>

        <h1>{category.name}</h1>
        <StationList stations={category.stations} stationName={category.name} />
    </div>

}
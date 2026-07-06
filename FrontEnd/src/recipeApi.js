export async function getRecipes() {
    const response = await fetch("https://dummyjson.com/recipes");
    const data = await response.json();

    return data.recipes.map(recipe => ({
        ...recipe,
        price: 100 + ((recipe.id * 37) % 200)
    }));
}
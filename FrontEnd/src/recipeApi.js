export async function getRecipes() {
  try {
    const response = await fetch(
      "https://dummyjson.com/recipes?limit=100"
    );

    const data = await response.json();

    return data.recipes;

  } catch (error) {
    console.error(error);
    return [];
  }
}
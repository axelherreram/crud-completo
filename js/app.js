document.addEventListener("DOMContentLoaded", () => {
  const moviesContainer = document.getElementById("movies-container");
  const movieModal = new bootstrap.Modal(document.getElementById("movieModal"));
  const newMovieModal = new bootstrap.Modal(
    document.getElementById("newMovieModal")
  );
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const addMovieBtn = document.getElementById("addMovieBtn");

  let currentMovie;

  // Función para crear una tarjeta personalizada
  function createMovieCard(movie) {
    return `
            <div class="card-custom">
                <img src="${movie.Poster}" alt="${movie.Title}" class="card-custom-img cursor-pointer" data-id="${movie.imdbID}" onclick="window.location.href='html/movie-details.html?imdbID=${movie.imdbID}'">
                <div class="card-custom-body">
                    <h5 class="card-custom-title">${movie.Title}</h5>
                    <p class="card-custom-type"><strong>Tipo:</strong> ${movie.Type}</p>
                    <p class="card-custom-year"><strong>Año:</strong> ${movie.Year}</p>
                    <p class="card-custom-ubication"><strong>Ubicación:</strong> ${movie.Ubication}</p>
                    <div class="d-flex justify-content-center gap-2">
                    <button type="button" class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#movieModal" data-id="${movie.imdbID}"> <i class="bi bi-pencil-square"></i> Actualizar</button>
                    <button type="button" class="btn btn-danger mt-3" data-id="${movie.imdbID}"><i class="bi bi-trash"></i> Eliminar</button>
                    </div>
                </div>
            </div>
        `;
  }

  // Función para abrir el modal con la información de la película
  function openMovieModal(movie) {
    document.getElementById("imdbID").value = movie.imdbID || "";
    document.getElementById("title").value = movie.Title || "";
    document.getElementById("year").value = movie.Year || "";
    document.getElementById("type").value = movie.Type || "";
    document.getElementById("poster").value = movie.Poster || "";
    document.getElementById("description").value = movie.description || "";
    document.getElementById("ubication").value = movie.Ubication || "";
    document.getElementById("estado").value = movie.Estado || "";

    currentMovie = movie;
    movieModal.show();
  }

  // Función para abrir el modal de nueva película
  function openNewMovieModal() {
    document.getElementById("newMovieForm").reset();
    newMovieModal.show();
  }

  // Función para obtener y mostrar las películas
  function fetchMovies() {
    fetch("https://movie.azurewebsites.net/api/cartelera?title=&ubication=")
      .then((response) => response.json())
      .then((data) => {
        moviesContainer.innerHTML = ""; // Limpiar el contenedor antes de insertar
        data.slice(1).forEach((movie) => {
          // Omitir la primera película
          const movieCard = createMovieCard(movie);
          moviesContainer.innerHTML += movieCard;
        });

        // Añadir eventos a los botones de actualizar y eliminar
        document
          .querySelectorAll('.btn-primary[data-bs-target="#movieModal"]')
          .forEach((button) => {
            button.addEventListener("click", () => {
              const movieID = button.getAttribute("data-id");
              const movie = data.find((m) => m.imdbID === movieID);
              openMovieModal(movie);
            });
          });

        document.querySelectorAll(".btn-danger").forEach((button) => {
          button.addEventListener("click", () => {
            const movieID = button.getAttribute("data-id");
            const movie = data.find((m) => m.imdbID === movieID);
            Swal.fire({
              title: "¿Estás seguro?",
              text: "¡No podrás recuperar esta película!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Sí, eliminar",
              cancelButtonText: "Cancelar",
            }).then((result) => {
              if (result.isConfirmed) {
                fetch(
                  `https://movie.azurewebsites.net/api/cartelera?imdbID=${movieID}`,
                  {
                    method: "DELETE",
                  }
                )
                  .then((response) => {
                    if (response.ok) {
                      Swal.fire(
                        "Eliminado",
                        "La película ha sido eliminada.",
                        "success"
                      );
                      fetchMovies(); // Volver a cargar las películas
                    } else {
                      Swal.fire(
                        "Error",
                        "No se pudo eliminar la película.",
                        "error"
                      );
                    }
                  })
                  .catch((error) =>
                    console.error("Error al eliminar la película:", error)
                  );
              }
            });
          });
        });
      })
      .catch((error) =>
        console.error("Error al obtener las películas:", error)
      );
  }

  // Función para guardar los cambios y hacer PUT
  saveChangesBtn.addEventListener("click", () => {
    const imdbID = document.getElementById("imdbID")?.value.trim() || "";
    const updatedMovie = {
      imdbID: imdbID,
      Title: document.getElementById("title")?.value.trim() || "",
      Year: document.getElementById("year")?.value.trim() || "",
      Type: document.getElementById("type")?.value.trim() || "",
      Poster: document.getElementById("poster")?.value.trim() || "",
      Estado: document.getElementById("estado")?.value === "true", // Convertir a booleano
      description: document.getElementById("description")?.value.trim() || "",
      Ubication: document.getElementById("ubication")?.value.trim() || "",
    };

    fetch(
      `https://movie.azurewebsites.net/api/cartelera?imdbID=${updatedMovie.imdbID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMovie),
      }
    )
      .then((response) => {
        if (response.ok) {
          Swal.fire("Éxito", "Película actualizada correctamente", "success");
          movieModal.hide(); // Asegurarse de que la instancia de movieModal esté correctamente inicializada
          fetchMovies(); // Volver a cargar las películas para reflejar los cambios
        } else {
          return response.text().then((text) => {
            throw new Error(text);
          }); // Captura el mensaje de error del servidor
        }
      })
      .catch((error) =>
        Swal.fire(
          "Error",
          `No se pudo actualizar la película: ${error.message}`,
          "error"
        )
      );
  });

  // Función para agregar una nueva película
  addMovieBtn.addEventListener("click", () => {
    const newMovie = {
      imdbID: document.getElementById("newImdbID")?.value.trim() || "", // Eliminar espacios en blanco
      Title: document.getElementById("newTitle")?.value.trim() || "", // Eliminar espacios en blanco
      Year: document.getElementById("newYear")?.value.trim() || "", // Eliminar espacios en blanco
      Type: document.getElementById("newType")?.value.trim() || "...", // Asignar un valor por defecto si está vacío
      Poster: document.getElementById("newPoster")?.value.trim() || "", // Eliminar espacios en blanco
      Estado: document.getElementById("newEstado")?.value === "true", // Convertir a booleano
      description:
        document.getElementById("newDescription")?.value.trim() || "", // Eliminar espacios en blanco
      Ubication: document.getElementById("newUbication")?.value.trim() || "", // Eliminar espacios en blanco
    };

    // Validación adicional para asegurarse de que los campos críticos no estén vacíos
    if (
      newMovie.imdbID === "" ||
      newMovie.Title === "" ||
      newMovie.Year === "" ||
      newMovie.Type === "" ||
      newMovie.Poster === ""
    ) {
      Swal.fire(
        "Error",
        "Por favor, complete todos los campos requeridos.",
        "error"
      );
      return;
    }

    fetch("https://movie.azurewebsites.net/api/cartelera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMovie),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire("Éxito", "Película agregada correctamente", "success");
          newMovieModal.hide(); // Asegúrate de que la instancia de newMovieModal esté correctamente inicializada
          fetchMovies(); // Volver a cargar las películas para reflejar los cambios
        } else {
          return response.text().then((text) => {
            throw new Error(text);
          }); // Captura el mensaje de error del servidor
        }
      })
      .catch((error) =>
        Swal.fire(
          "Error",
          `No se pudo agregar la película: ${error.message}`,
          "error"
        )
      );
  });

  // Inicializar la carga de películas
  fetchMovies();
});

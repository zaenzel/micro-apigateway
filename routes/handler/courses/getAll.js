const apiAdapter = require("../../apiAdapter");
const { URL_SERVICE_COURSE, HOSTNAME } = process.env;
const api = apiAdapter(URL_SERVICE_COURSE);

module.exports = async (req, res) => {
  try {
    const courses = await api.get("/api/courses", {
      params: {
        ...req.query,
        status: "published",
      },
    });

    const coursesData = courses.data;

    const firstPageUrl = coursesData.data.first_page_url.split("?").pop();
    const lastPageUrl = coursesData.data.last_page_url.split("?").pop();

    if (coursesData.data.next_page_url) {
      const nextPage = coursesData.data.next_page_url.split("?").pop();
      coursesData.data.next_page_url = `${HOSTNAME}/courses?${nextPage}`;
    }

    if (coursesData.data.prev_page_url) {
      const prevPage = coursesData.data.prev_page_url.split("?").pop();
      coursesData.data.prev_page_url = `${HOSTNAME}/courses?${prevPage}`;
    }

    coursesData.data.first_page_url = `${HOSTNAME}/courses?${firstPageUrl}`;
    coursesData.data.last_page_url = `${HOSTNAME}/courses?${lastPageUrl}`;

    coursesData.data.path = `${HOSTNAME}/courses`;

    coursesData.data.links.map((e) => {
        if (e.url) {
            let query = e.url.split('?').pop()
            return e.url = `${HOSTNAME}/courses/${query}`
        }
    })

    return res.json(coursesData);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res
        .status(500)
        .json({ status: "error", message: "service unavailable" });
    }

    const { status, data } = error.response;
    return res.status(status).json(data);
  }
};

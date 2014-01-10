using ServiceStack;

namespace demo.services
{
    [Route("/File")]
    [Route("/File/{Id}")]
    public class File
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
    }
}
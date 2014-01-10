using System.Collections.Generic;
using System.Linq;
using ServiceStack;

namespace demo.services
{
    public class FileService : Service
    {
        private static readonly List<File> files;
 
        static FileService()
        {
            files = new List<File>();
          
            files.Add(new File
            {
                Id = 1,
                Name = "File 1"
            });
            files.Add(new File
            {
                Id = 2,
                Name = "File 2"
            });
            files.Add(new File
            {
                Id = 3,
                Name = "File 3"
            });
        }

        public object Any(File request)
        {
            return files;
        }

        public object Post(File file)
        {
            var id = files.Count + 1;
            file.Id = id;
            file.Name = file.Url;
            file.Url = "http://yoururl.com/" + id;
            files.Add(file);
            return null;
        }

        public object Put(File file)
        {
            var selectedFile = files.First(n => n.Id == file.Id);
            selectedFile.Name = file.Name;
            return null;
        }

        public object Delete(File file)
        {
            var selectedFile = files.First(n => n.Id == file.Id);
            files.Remove(selectedFile);
            return null;
        }
    }
}